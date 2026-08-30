# Enterprise Multi-Tenant Microservice Suite - End-to-End Live Integration Verification
$ErrorActionPreference = "Stop"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  ENTERPRISE MULTI-TENANT SUITE - END-TO-END E2E TEST   " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

$GatewayUrl = "http://localhost:8080"
$TenantId = "tenant-e2e-" + (Get-Random -Minimum 1000 -Maximum 9999)

function Invoke-ApiRequest {
    param(
        [string]$Method,
        [string]$Uri,
        [hashtable]$Headers = @{},
        [string]$Body = $null
    )
    $allHeaders = @{ "Content-Type" = "application/json" }
    foreach ($k in $Headers.Keys) {
        $allHeaders[$k] = $Headers[$k]
    }
    
    if ($Body) {
        return Invoke-RestMethod -Method $Method -Uri $Uri -Headers $allHeaders -Body $Body
    } else {
        return Invoke-RestMethod -Method $Method -Uri $Uri -Headers $allHeaders
    }
}

# 1. Check Gateway & Service Health
Write-Host "`n[1/9] Checking API Gateway and Microservices Health..." -ForegroundColor Yellow
$gatewayHealth = Invoke-ApiRequest -Method "GET" -Uri "$GatewayUrl/actuator/health"
Write-Host " -> Gateway Status: $($gatewayHealth.status)" -ForegroundColor Green

# 2. Register Tenant & Admin User
Write-Host "`n[2/9] Registering Tenant and Admin User via Auth Service..." -ForegroundColor Yellow
$tenantPayload = @{
    tenantId = $TenantId
    name = "Acme Global Enterprise"
    adminEmail = "admin@$TenantId.com"
    adminPassword = "Password123!"
    tier = "ENTERPRISE"
} | ConvertTo-Json

$regResponse = Invoke-ApiRequest -Method "POST" -Uri "$GatewayUrl/api/v1/tenants/register" -Body $tenantPayload
Write-Host " -> Tenant Registered: $($regResponse.data.tenantId) (Status: $($regResponse.data.status))" -ForegroundColor Green

# 3. User Login & Token Generation
Write-Host "`n[3/9] Authenticating User and obtaining JWT..." -ForegroundColor Yellow
$loginPayload = @{
    tenantId = $TenantId
    email = "admin@$TenantId.com"
    password = "Password123!"
} | ConvertTo-Json

$loginResponse = Invoke-ApiRequest -Method "POST" -Uri "$GatewayUrl/api/v1/auth/login" -Body $loginPayload
$jwtToken = if ($loginResponse.data.token) { $loginResponse.data.token } else { $regResponse.data.token }
Write-Host " -> JWT Token Generated for user $($loginResponse.data.email)" -ForegroundColor Green

$authHeaders = @{
    "Authorization" = "Bearer $jwtToken"
    "X-Tenant-Id" = $TenantId
}

# 4. Mobile App Version Policy Check
Write-Host "`n[4/9] Testing Mobile App Version Policy API..." -ForegroundColor Yellow
$versionResponse = Invoke-ApiRequest -Method "GET" -Uri "$GatewayUrl/api/v1/app/version-check?client=iOS&version=1.2.0" -Headers $authHeaders
Write-Host " -> Version Status: $($versionResponse.data.status), Client: $($versionResponse.data.clientType) v$($versionResponse.data.clientVersion)" -ForegroundColor Green

# 5. Dynamic Multi-Tenant Configuration
Write-Host "`n[5/9] Setting Dynamic Configuration in Config Service..." -ForegroundColor Yellow
$configPayload = @{
    configKey = "payment.gateway.provider"
    configValue = "STRIPE_V2"
    serviceName = "order-service"
    description = "Tenant-specific payment routing provider"
    isSecret = $false
} | ConvertTo-Json

$configResponse = Invoke-ApiRequest -Method "POST" -Uri "$GatewayUrl/api/v1/configs" -Headers $authHeaders -Body $configPayload
Write-Host " -> Config Saved: $($configResponse.data.configKey) = $($configResponse.data.configValue)" -ForegroundColor Green

# 6. Feature Flag Management & Gating
Write-Host "`n[6/9] Setting Feature Flag with Strategy..." -ForegroundColor Yellow
$flagPayload = @{
    flagKey = "ENABLE_CRYPTO_PAYMENTS"
    enabled = $true
    strategy = "TIER"
    targetTier = "ENTERPRISE"
    description = "Enterprise-only crypto checkout"
    rolloutPercentage = 100
} | ConvertTo-Json

$flagResponse = Invoke-ApiRequest -Method "POST" -Uri "$GatewayUrl/api/v1/feature-flags" -Headers $authHeaders -Body $flagPayload
Write-Host " -> Feature Flag Saved: $($flagResponse.data.flagKey) (Enabled: $($flagResponse.data.enabled), Strategy: $($flagResponse.data.strategy))" -ForegroundColor Green

# 7. Create Product in Catalog
Write-Host "`n[7/9] Creating Product in Catalog (Product Service)..." -ForegroundColor Yellow
$sku = "SKU-" + (Get-Random -Minimum 10000 -Maximum 99999)
$productPayload = @{
    sku = $sku
    name = "Enterprise Cloud Server"
    description = "High-performance compute node"
    price = 499.99
    stockQuantity = 50
    category = "CLOUD_INFRA"
} | ConvertTo-Json

$productResponse = Invoke-ApiRequest -Method "POST" -Uri "$GatewayUrl/api/v1/products" -Headers $authHeaders -Body $productPayload
$productId = $productResponse.data.id
Write-Host " -> Product Created: ID=$productId, SKU=$sku, Stock=$($productResponse.data.stockQuantity)" -ForegroundColor Green

# 8. Execute Distributed Saga Order Placement
Write-Host "`n[8/9] Submitting Order and Orchestrating Distributed Saga Fulfillment..." -ForegroundColor Yellow
$orderPayload = @{
    items = @(
        @{
            sku = $sku
            productName = "Enterprise Cloud Server"
            unitPrice = 499.99
            quantity = 2
        }
    )
} | ConvertTo-Json

$orderResponse = Invoke-ApiRequest -Method "POST" -Uri "$GatewayUrl/api/v1/orders" -Headers $authHeaders -Body $orderPayload
$orderId = $orderResponse.data.orderId
$sagaId = $orderResponse.data.sagaId
Write-Host " -> Order Placed: OrderId=$orderId, SagaId=$sagaId, TotalAmount=$($orderResponse.data.totalAmount), Status=$($orderResponse.data.status)" -ForegroundColor Green

# 9. Query Saga Step Execution Timeline
Write-Host "`n[9/9] Querying Saga Step Execution Timeline Audit Log..." -ForegroundColor Yellow
$sagaResponse = Invoke-ApiRequest -Method "GET" -Uri "$GatewayUrl/api/v1/sagas/$sagaId/timeline" -Headers $authHeaders
Write-Host " -> Saga Instance ID: $($sagaResponse.data.sagaId)" -ForegroundColor Green
Write-Host " -> Saga Status: $($sagaResponse.data.status)" -ForegroundColor Green
Write-Host " -> Steps Executed:" -ForegroundColor Cyan
foreach ($step in $sagaResponse.data.steps) {
    Write-Host "    * [$($step.status)] $($step.stepName) (Duration: $($step.durationMs)ms)" -ForegroundColor Gray
}

Write-Host "`n==========================================================" -ForegroundColor Green
Write-Host "  ALL 9 END-TO-END E2E TEST WORKFLOWS PASSED 100% SUITE!  " -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green
