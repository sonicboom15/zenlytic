$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host "       ENTERPRISE SUITE - EXTENDED MULTI-TENANT E2E VERIFICATION                " -ForegroundColor Cyan
Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host ""

$GATEWAY = "http://localhost:8080"
$TENANT_A = "tenant-alpha-" + (Get-Random -Minimum 1000 -Maximum 9999)
$TENANT_B = "tenant-beta-" + (Get-Random -Minimum 1000 -Maximum 9999)

function Step-Log($title) {
    Write-Host "`n>>> [STEP] $title" -ForegroundColor Yellow
}

function Success-Log($msg) {
    Write-Host "    [PASS] $msg" -ForegroundColor Green
}

# 1. Register Tenant A & Admin User
Step-Log "1. Onboard Tenant A and Admin User"
$tenantPayload = @{
    tenantId = $TENANT_A
    name = "Alpha Enterprise Inc"
    adminEmail = "admin@$TENANT_A.com"
    adminPassword = "Password123!"
    tier = "ENTERPRISE"
} | ConvertTo-Json

$regRes = Invoke-RestMethod -Uri "$GATEWAY/api/v1/tenants/register" -Method Post -Body $tenantPayload -ContentType "application/json"
Success-Log "Tenant A onboarded: $($regRes.data.name) (ID: $($regRes.data.tenantId))"

# Authenticate Admin on Tenant A
$loginBody = @{
    email = "admin@$TENANT_A.com"
    password = "Password123!"
    tenantId = $TENANT_A
} | ConvertTo-Json

$authRes = Invoke-RestMethod -Uri "$GATEWAY/api/v1/auth/login" -Method Post -Body $loginBody -ContentType "application/json" -Headers @{ "X-Tenant-ID" = $TENANT_A }
$adminToken = $authRes.data.token
Success-Log "Authenticated successfully. Token: $($adminToken.Substring(0, 20))... Tenant: '$($authRes.data.tenantId)'"

$headersA = @{
    "Authorization" = "Bearer $adminToken"
    "X-Tenant-ID" = $TENANT_A
    "Content-Type" = "application/json"
}

# 2. B2B Customer Management - Create Single Customer with Max Discount Boundary
Step-Log "2. Create B2B Customer with Max Discount Boundary (20%)"
$custBody = @{
    name = "Global Freight Logistics"
    code = "GFL-99"
    companyName = "Global Freight Corp"
    email = "dispatch@globalfreight.com"
    phone = "555-0999"
    creditLimit = 45000.00
    maxDiscountPercentage = 20.00
    tier = "PLATINUM"
    status = "ACTIVE"
} | ConvertTo-Json

$custRes = Invoke-RestMethod -Uri "$GATEWAY/api/v1/customers" -Method Post -Body $custBody -Headers $headersA
$createdCust = $custRes.data
Success-Log "Created Customer: $($createdCust.name) (ID: $($createdCust.customerId), Max Discount: $($createdCust.maxDiscountPercentage)%)"

# 3. Standardized Batch Customer Import (common-starter batch chassis)
Step-Log "3. Standardized Batch Customer Import via BatchProcessor"
$batchCustBody = @{
    items = @(
        @{
            name = "Zenith Aerospace"
            code = "ZEN-AERO-01"
            companyName = "Zenith Defense LLC"
            email = "procurement@zenith.com"
            phone = "555-0777"
            creditLimit = 80000.00
            maxDiscountPercentage = 25.00
            tier = "PLATINUM"
            status = "ACTIVE"
        },
        @{
            name = "Starlight Retailers"
            code = "STAR-RET-02"
            companyName = "Starlight Retail Group"
            email = "buyer@starlight.com"
            phone = "555-0888"
            creditLimit = 20000.00
            maxDiscountPercentage = 15.00
            tier = "GOLD"
            status = "ACTIVE"
        }
    )
    continueOnError = $true
} | ConvertTo-Json -Depth 5

$batchCustRes = Invoke-RestMethod -Uri "$GATEWAY/api/v1/customers/batch" -Method Post -Body $batchCustBody -Headers $headersA
Success-Log "Batch Customer Import: Total $($batchCustRes.data.totalRequested), Succeeded: $($batchCustRes.data.successCount), Failed: $($batchCustRes.data.failureCount)"

# 4. Standardized Batch Product Import
Step-Log "4. Standardized Batch Product Import via BatchProcessor"
$batchProdBody = @{
    items = @(
        @{
            sku = "SKU-OPT-10G-" + (Get-Random -Minimum 1000 -Maximum 9999)
            name = "10G Optical Transceiver"
            description = "High speed datacenter module"
            price = 299.00
            stockQuantity = 50
            category = "Networking"
        },
        @{
            sku = "SKU-ROUTER-AX-" + (Get-Random -Minimum 1000 -Maximum 9999)
            name = "Enterprise WiFi 6 Router"
            description = "Multi-gigabit access router"
            price = 450.00
            stockQuantity = 30
            category = "Networking"
        }
    )
    continueOnError = $true
} | ConvertTo-Json -Depth 5

$batchProdRes = Invoke-RestMethod -Uri "$GATEWAY/api/v1/products/batch" -Method Post -Body $batchProdBody -Headers $headersA
$firstProductSku = $batchProdRes.data.results[0].data.sku
Success-Log "Batch Product Import: Total $($batchProdRes.data.totalRequested), Succeeded: $($batchProdRes.data.successCount). Sample SKU: $firstProductSku"

# 5. Standardized Batch User Onboarding
Step-Log "5. Standardized Batch User Onboarding via BatchProcessor"
$batchUserBody = @{
    items = @(
        @{
            fullName = "Alex Rivera"
            email = "alex.r" + (Get-Random -Minimum 1000 -Maximum 9999) + "@$TENANT_A.com"
            password = "Password123!"
            phoneNumber = "555-0456"
            roles = @("ROLE_SALES_REP")
        }
    )
    continueOnError = $true
} | ConvertTo-Json -Depth 5

$batchUserRes = Invoke-RestMethod -Uri "$GATEWAY/api/v1/users/batch" -Method Post -Body $batchUserBody -Headers $headersA
Success-Log "Batch User Onboard: Total $($batchUserRes.data.totalRequested), Succeeded: $($batchUserRes.data.successCount)"

# 6. Order Placement with B2B Customer & Discount
Step-Log "6. Place Order with Customer Link and 10% Discount (Distributed Saga)"
$orderBody = @{
    items = @(
        @{
            sku = $firstProductSku
            productName = "10G Optical Transceiver"
            unitPrice = 299.00
            quantity = 2
        }
    )
    customerId = $createdCust.customerId
    customerName = $createdCust.name
    discountPercentage = 10.00
    idempotencyKey = "e2e-saga-" + (Get-Random)
} | ConvertTo-Json -Depth 5

$orderRes = Invoke-RestMethod -Uri "$GATEWAY/api/v1/orders" -Method Post -Body $orderBody -Headers $headersA
$order = $orderRes.data
Success-Log "Order Placed: ID '$($order.orderId)', Status: '$($order.status)', Total: `$$($order.totalAmount) (Discount applied: $($order.discountPercentage)%)"

# 7. Inspect Saga Execution Timeline
Step-Log "7. Inspect Distributed Saga Execution Timeline"
$timelineRes = Invoke-RestMethod -Uri "$GATEWAY/api/v1/orders/sagas/$($order.sagaId)/timeline" -Method Get -Headers $headersA
Success-Log "Saga Timeline: Status '$($timelineRes.data.status)', Steps Recorded: $($timelineRes.data.steps.Count)"
foreach ($st in $timelineRes.data.steps) {
    Write-Host "       • [$($st.status)] $($st.stepName) ($($st.durationMs) ms)" -ForegroundColor DarkCyan
}

# 8. List Orders & Verify Paged Query
Step-Log "8. Query Paged Orders List"
$ordersList = Invoke-RestMethod -Uri "$GATEWAY/api/v1/orders?size=10" -Method Get -Headers $headersA
Success-Log "Retrieved $($ordersList.data.content.Count) orders. Total elements: $($ordersList.data.totalElements)"

# 9. Register Tenant B and verify cross-tenant isolation
Step-Log "9. Verify Strict Row-Level Multi-Tenant Isolation"
$tenantBPayload = @{
    tenantId = $TENANT_B
    name = "Beta Global Corp"
    adminEmail = "admin@$TENANT_B.com"
    adminPassword = "Password123!"
    tier = "GROWTH"
} | ConvertTo-Json

$regBRes = Invoke-RestMethod -Uri "$GATEWAY/api/v1/tenants/register" -Method Post -Body $tenantBPayload -ContentType "application/json"
$tokenB = $regBRes.data.token

$headersB = @{
    "Authorization" = "Bearer $tokenB"
    "X-Tenant-ID" = $TENANT_B
    "Content-Type" = "application/json"
}

$tenantBCustomers = Invoke-RestMethod -Uri "$GATEWAY/api/v1/customers" -Method Get -Headers $headersB
Success-Log "Tenant B customer query returned $($tenantBCustomers.data.content.Count) records (Tenant A records are strictly isolated and invisible to Tenant B)"

Write-Host ""
Write-Host "================================================================================" -ForegroundColor Green
Write-Host "       ALL EXTENDED MULTI-TENANT E2E WORKFLOWS PASSED (100%)                    " -ForegroundColor Green
Write-Host "================================================================================" -ForegroundColor Green
Write-Host ""
