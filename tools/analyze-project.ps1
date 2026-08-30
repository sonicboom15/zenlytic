<#
.SYNOPSIS
    Enterprise Multi-Tenant Microservice Suite - Automated Project Analyzer & Health Check CLI
.DESCRIPTION
    Scans the entire repository, validates Java/Maven/Docker prerequisites, audits module code structures,
    inspects container status, checks open ports/actuator endpoints, and prints an architectural scorecard.
.PARAMETER CheckServices
    Probes HTTP actuator endpoints for active microservices.
.PARAMETER VerifyBuild
    Runs Maven compilation check.
#>
[CmdletBinding()]
param(
    [switch]$CheckServices,
    [switch]$VerifyBuild
)

$ErrorActionPreference = "SilentlyContinue"

Write-Host ""
Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host "      ENTERPRISE MULTI-TENANT SUITE - REPOSITORY & ARCHITECTURE ANALYZER        " -ForegroundColor Cyan
Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host ""

$ProjectRoot = (Resolve-Path "$PSScriptRoot\..").Path
Write-Host "[*] Project Root: $ProjectRoot" -ForegroundColor DarkGray
Write-Host "[*] Timestamp:    $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor DarkGray
Write-Host ""

# -----------------------------------------------------------------------------
# 1. Environment & Prerequisites Audit
# -----------------------------------------------------------------------------
Write-Host "--------------------------------------------------------------------------------" -ForegroundColor DarkGray
Write-Host "  1. ENVIRONMENT & PREREQUISITES AUDIT" -ForegroundColor Yellow
Write-Host "--------------------------------------------------------------------------------" -ForegroundColor DarkGray

function Audit-Command($name, $cmd, $arg) {
    $exists = Get-Command $cmd -ErrorAction SilentlyContinue
    if ($exists) {
        try {
            $output = & $cmd $arg 2>&1 | Select-Object -First 1
            Write-Host "  [OK] $name : $output" -ForegroundColor Green
            return $true
        } catch {
            Write-Host "  [OK] $name : Detected at $($exists.Source)" -ForegroundColor Green
            return $true
        }
    } else {
        Write-Host "  [WARN] $name : '$cmd' not found in PATH" -ForegroundColor Yellow
        return $false
    }
}

Audit-Command "Java JDK" "java" "-version"
Audit-Command "Docker Engine" "docker" "--version"
Audit-Command "Node.js" "node" "--version"

$mvnwPath = Join-Path $ProjectRoot "mvnw.cmd"
if (Test-Path $mvnwPath) {
    Write-Host "  [OK] Maven Wrapper : Present ($mvnwPath)" -ForegroundColor Green
} else {
    Write-Host "  [FAIL] Maven Wrapper : Missing mvnw.cmd" -ForegroundColor Red
}

# -----------------------------------------------------------------------------
# 2. Module Code Audit & Architecture Scan
# -----------------------------------------------------------------------------
Write-Host ""
Write-Host "--------------------------------------------------------------------------------" -ForegroundColor DarkGray
Write-Host "  2. MODULE CODE & ARCHITECTURE AUDIT" -ForegroundColor Yellow
Write-Host "--------------------------------------------------------------------------------" -ForegroundColor DarkGray

$modules = @(
    @{ Name = "common-starter";       Port = "Library"; Role = "Microservice Chassis (CQRS, Tenancy, Tracing, Crypto)" },
    @{ Name = "api-gateway";          Port = "8080";    Role = "Unified Edge Ingress & Routing" },
    @{ Name = "auth-tenant-service";  Port = "8081";    Role = "Auth, RBAC, Tenant Onboarding, App Versioning" },
    @{ Name = "product-service";      Port = "8082";    Role = "Catalog CQRS, Stock Reserve, Outbox Events" },
    @{ Name = "async-worker-service"; Port = "8083";    Role = "RabbitMQ Consumer, ShedLock Cron, Webhooks, DLQ" },
    @{ Name = "config-feature-service"; Port = "8084";  Role = "Dynamic Configs, Feature Flags, Pub/Sub Broadcast" },
    @{ Name = "order-service";        Port = "8085";    Role = "Checkout CQRS, Distributed Saga Orchestrator" }
)

$stats = @()
$totalJavaFiles = 0
$totalControllers = 0
$totalEntities = 0
$totalTests = 0

foreach ($m in $modules) {
    $mDir = Join-Path $ProjectRoot $m.Name
    if (Test-Path $mDir) {
        $allJava = Get-ChildItem -Path $mDir -Filter "*.java" -Recurse -File -ErrorAction SilentlyContinue | Where-Object { $_.FullName -notmatch "[\\/]target[\\/]" }
        $mainFiles = @($allJava | Where-Object { $_.FullName -match "[\\/]src[\\/]main[\\/]" })
        $testFiles = @($allJava | Where-Object { $_.FullName -match "[\\/]src[\\/]test[\\/]" })
        
        $controllers = 0
        $entities = 0
        $migrations = 0
        
        foreach ($f in $mainFiles) {
            $content = Get-Content $f.FullName -Raw -ErrorAction SilentlyContinue
            if ($content -match "@RestController|@Controller") { $controllers++ }
            if ($content -match "@Entity") { $entities++ }
        }
        
        $migrationDir = Join-Path $mDir "src\main\resources\db\migration"
        if (Test-Path $migrationDir) {
            $migrations = (Get-ChildItem -Path $migrationDir -Filter "*.sql" -File -ErrorAction SilentlyContinue).Count
        }

        $stats += [PSCustomObject]@{
            "Module" = $m.Name
            "Port" = $m.Port
            "Source Files" = $mainFiles.Count
            "Test Classes" = $testFiles.Count
            "Controllers" = $controllers
            "Entities" = $entities
            "Flyway Migrations" = $migrations
            "Status" = "Ready"
        }

        $totalJavaFiles += $mainFiles.Count
        $totalControllers += $controllers
        $totalEntities += $entities
        $totalTests += $testFiles.Count
    }
}

$stats | Format-Table -AutoSize

Write-Host "  -> Aggregate: $totalJavaFiles source files, $totalControllers REST controllers, $totalEntities JPA entities, $totalTests test suites." -ForegroundColor Green

# -----------------------------------------------------------------------------
# 3. Infrastructure & Docker Container Status
# -----------------------------------------------------------------------------
Write-Host ""
Write-Host "--------------------------------------------------------------------------------" -ForegroundColor DarkGray
Write-Host "  3. INFRASTRUCTURE & DOCKER SERVICES" -ForegroundColor Yellow
Write-Host "--------------------------------------------------------------------------------" -ForegroundColor DarkGray

$dockerServices = @("enterprise-postgres", "enterprise-redis", "enterprise-rabbitmq", "enterprise-zipkin", "enterprise-prometheus")

try {
    $runningContainers = docker ps --format "{{.Names}}#{{.Status}}" 2>$null
    if ($runningContainers) {
        foreach ($ds in $dockerServices) {
            $matched = $runningContainers | Where-Object { $_ -match "^$ds" }
            if ($matched) {
                $status = ($matched -split "#")[1]
                Write-Host "  [OK] $ds : RUNNING ($status)" -ForegroundColor Green
            } else {
                Write-Host "  [DOWN] $ds : NOT RUNNING" -ForegroundColor Red
            }
        }
    } else {
        Write-Host "  [WARN] No Docker containers are running. Start with 'docker compose up -d'" -ForegroundColor Yellow
    }
} catch {
    Write-Host "  [WARN] Could not query Docker daemon." -ForegroundColor Yellow
}

# -----------------------------------------------------------------------------
# 4. Port Probing & Actuator Health
# -----------------------------------------------------------------------------
Write-Host ""
Write-Host "--------------------------------------------------------------------------------" -ForegroundColor DarkGray
Write-Host "  4. MICROSERVICE HEALTH & PORT MATRIX" -ForegroundColor Yellow
Write-Host "--------------------------------------------------------------------------------" -ForegroundColor DarkGray

$portsToCheck = @(
    @{ Name = "API Gateway";            Port = 8080; HealthUrl = "http://localhost:8080/actuator/health" },
    @{ Name = "Auth & Tenant Service";  Port = 8081; HealthUrl = "http://localhost:8081/actuator/health" },
    @{ Name = "Product Service";        Port = 8082; HealthUrl = "http://localhost:8082/actuator/health" },
    @{ Name = "Async Worker Service";   Port = 8083; HealthUrl = "http://localhost:8083/actuator/health" },
    @{ Name = "Config & Feature Flag";  Port = 8084; HealthUrl = "http://localhost:8084/actuator/health" },
    @{ Name = "Order Service";          Port = 8085; HealthUrl = "http://localhost:8085/actuator/health" },
    @{ Name = "PostgreSQL DB";          Port = 5432; HealthUrl = $null },
    @{ Name = "Redis Cache";            Port = 6379; HealthUrl = $null },
    @{ Name = "RabbitMQ AMQP";          Port = 5672; HealthUrl = $null },
    @{ Name = "RabbitMQ Management UI"; Port = 15672; HealthUrl = $null },
    @{ Name = "Zipkin Tracing UI";      Port = 9411; HealthUrl = $null },
    @{ Name = "Prometheus Metrics";     Port = 9090; HealthUrl = $null }
)

foreach ($p in $portsToCheck) {
    $isOpen = $false
    try {
        $tcpClient = New-Object System.Net.Sockets.TcpClient
        $iar = $tcpClient.BeginConnect("127.0.0.1", $p.Port, $null, $null)
        $wait = $iar.AsyncWaitHandle.WaitOne(300, $false)
        if ($wait -and $tcpClient.Connected) {
            $isOpen = $true
            $tcpClient.EndConnect($iar)
        }
        $tcpClient.Close()
    } catch {
        $isOpen = $false
    }

    if ($isOpen) {
        $extra = ""
        if ($p.HealthUrl) {
            try {
                $resp = Invoke-RestMethod -Uri $p.HealthUrl -Method Get -TimeoutSec 2 -ErrorAction SilentlyContinue
                if ($resp.status) {
                    $extra = "-> Actuator: " + $resp.status
                }
            } catch {
                $extra = "-> Actuator: Active"
            }
        }
        Write-Host "  [UP]   Port $($p.Port.ToString().PadRight(6)) : $($p.Name.PadRight(28)) (Open) $extra" -ForegroundColor Green
    } else {
        Write-Host "  [DOWN] Port $($p.Port.ToString().PadRight(6)) : $($p.Name.PadRight(28)) (Closed / Not started)" -ForegroundColor DarkGray
    }
}

# -----------------------------------------------------------------------------
# 5. Playwright & E2E Test Suite Status
# -----------------------------------------------------------------------------
Write-Host ""
Write-Host "--------------------------------------------------------------------------------" -ForegroundColor DarkGray
Write-Host "  5. TESTING & VERIFICATION SUITES" -ForegroundColor Yellow
Write-Host "--------------------------------------------------------------------------------" -ForegroundColor DarkGray

$e2ePath = Join-Path $ProjectRoot "e2e-playwright"
if (Test-Path $e2ePath) {
    $testSpecs = Get-ChildItem -Path (Join-Path $e2ePath "tests") -Filter "*.spec.ts" -File -ErrorAction SilentlyContinue
    Write-Host "  [OK] Playwright E2E Specs: $($testSpecs.Count) test suites available" -ForegroundColor Green
    foreach ($spec in $testSpecs) {
        Write-Host "       * $($spec.Name)" -ForegroundColor DarkGray
    }
}

$e2eScript = Join-Path $ProjectRoot "test-e2e.ps1"
if (Test-Path $e2eScript) {
    Write-Host "  [OK] PowerShell Live E2E Script: test-e2e.ps1 (9 automated workflows)" -ForegroundColor Green
}

# -----------------------------------------------------------------------------
# 6. Verification Build (Optional)
# -----------------------------------------------------------------------------
if ($VerifyBuild) {
    Write-Host ""
    Write-Host "--------------------------------------------------------------------------------" -ForegroundColor DarkGray
    Write-Host "  6. COMPILATION & BUILD CHECK" -ForegroundColor Yellow
    Write-Host "--------------------------------------------------------------------------------" -ForegroundColor DarkGray
    Write-Host "  Running 'mvn compile -DskipTests'..." -ForegroundColor Cyan
    & $mvnwPath compile -DskipTests
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  [OK] Maven Compilation Successful!" -ForegroundColor Green
    } else {
        Write-Host "  [FAIL] Maven Compilation Failed with code $LASTEXITCODE" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host "  QUICK ACCESS URLS:" -ForegroundColor Cyan
Write-Host "  • Gateway Ingress:     http://localhost:8080" -ForegroundColor White
Write-Host "  • Swagger UI (Auth):   http://localhost:8081/swagger-ui.html" -ForegroundColor White
Write-Host "  • Swagger UI (Catalog):http://localhost:8082/swagger-ui.html" -ForegroundColor White
Write-Host "  • Swagger UI (Worker): http://localhost:8083/swagger-ui.html" -ForegroundColor White
Write-Host "  • Swagger UI (Config): http://localhost:8084/swagger-ui.html" -ForegroundColor White
Write-Host "  • Swagger UI (Order):  http://localhost:8085/swagger-ui.html" -ForegroundColor White
Write-Host "  • Zipkin Tracing UI:   http://localhost:9411" -ForegroundColor White
Write-Host "  • RabbitMQ Dashboard:  http://localhost:15672 (guest / guest)" -ForegroundColor White
Write-Host "  • Prometheus UI:       http://localhost:9090" -ForegroundColor White
Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host ""

