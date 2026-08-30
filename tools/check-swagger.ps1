$ErrorActionPreference = "Continue"

Write-Host ""
Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host "             ENTERPRISE SUITE - SWAGGER UI & OPENAPI AUDIT                     " -ForegroundColor Cyan
Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host ""

$services = @(
    @{ Name = "Auth & Tenant Service"; Port = 8081; Swagger = "http://localhost:8081/swagger-ui/index.html"; ApiDocs = "http://localhost:8081/v3/api-docs" },
    @{ Name = "Product Service";       Port = 8082; Swagger = "http://localhost:8082/swagger-ui/index.html"; ApiDocs = "http://localhost:8082/v3/api-docs" },
    @{ Name = "Async Worker Service";  Port = 8083; Swagger = "http://localhost:8083/swagger-ui/index.html"; ApiDocs = "http://localhost:8083/v3/api-docs" },
    @{ Name = "Config & Feature Flag"; Port = 8084; Swagger = "http://localhost:8084/swagger-ui/index.html"; ApiDocs = "http://localhost:8084/v3/api-docs" },
    @{ Name = "Order Service";         Port = 8085; Swagger = "http://localhost:8085/swagger-ui/index.html"; ApiDocs = "http://localhost:8085/v3/api-docs" }
)

foreach ($s in $services) {
    Write-Host "--------------------------------------------------------------------------------" -ForegroundColor DarkGray
    Write-Host "  $($s.Name) (Port $($s.Port))" -ForegroundColor Yellow
    Write-Host "--------------------------------------------------------------------------------" -ForegroundColor DarkGray
    
    # Check OpenAPI JSON
    try {
        $docs = Invoke-RestMethod -Uri $s.ApiDocs -Method Get -TimeoutSec 3 -ErrorAction Stop
        $pathsCount = ($docs.paths.PSObject.Properties | Measure-Object).Count
        Write-Host "  [OK] OpenAPI Spec (/v3/api-docs):" -ForegroundColor Green
        Write-Host "       • Title:        $($docs.info.title)" -ForegroundColor White
        Write-Host "       • Version:      $($docs.info.version)" -ForegroundColor White
        Write-Host "       • Description:  $($docs.info.description)" -ForegroundColor White
        Write-Host "       • Total Paths:  $pathsCount endpoints documented" -ForegroundColor White
    } catch {
        Write-Host "  [FAIL] OpenAPI Spec (/v3/api-docs): $($_.Exception.Message)" -ForegroundColor Red
    }

    # Check Swagger UI HTML
    try {
        $resp = Invoke-WebRequest -Uri $s.Swagger -Method Get -TimeoutSec 3 -UseBasicParsing -ErrorAction Stop
        Write-Host "  [OK] Swagger UI (HTML): HTTP $($resp.StatusCode) OK - UI Asset Loaded ($($resp.RawContentLength) bytes)" -ForegroundColor Green
    } catch {
        # Try /swagger-ui.html redirect
        try {
            $altUri = "http://localhost:$($s.Port)/swagger-ui.html"
            $resp2 = Invoke-WebRequest -Uri $altUri -Method Get -TimeoutSec 3 -UseBasicParsing -ErrorAction Stop
            Write-Host "  [OK] Swagger UI (HTML): HTTP $($resp2.StatusCode) via /swagger-ui.html" -ForegroundColor Green
        } catch {
            Write-Host "  [FAIL] Swagger UI: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
    Write-Host ""
}

Write-Host "================================================================================" -ForegroundColor Cyan
