# Enterprise Multi-Tenant Spring Boot Microservice Suite

A production-grade, Fortune 500–ready multi-tenant Spring Boot microservice suite engineered with modern distributed system design patterns:
- **Mobile API Versioning & RFC 8594 Sunset Lifecycle** (with Force-Update Policy API)
- **Unified API Gateway** (Path-based and Kubernetes-style Host Ingress routing)
- **Multi-Tenancy** (Hibernate 6 `@TenantId` row-level isolation, `TenantContextHolder`, per-tenant Redis caching & rate limiting)
- **CQRS Architecture** (`CommandBus` & `QueryBus` with separated read/write pipelines)
- **Distributed Sagas** (Multi-step Saga Orchestration with automated rollback compensation & audit timeline API)
- **Transactional Outbox Pattern** (Atomic dual-write prevention with PostgreSQL 16)
- **Distributed Clustered Cron & Scheduling** (ShedLock single-execution locks + Dynamic runtime scheduler)
- **Outbound Webhook Engine** (HMAC-SHA256 signature verification & delivery logs)
- **Enterprise Observability & Tracing** (W3C TraceContext, Micrometer, Zipkin UI, Prometheus metrics, Structured JSON/ECS logs, MDC, and PII masking)
- **High Concurrency** (Java 21 Virtual Threads & `ParallelWorkExecutor` context propagation)
- **Enterprise Data Protection** (AES-256-GCM column encryption, Soft Deletes `@SQLRestriction`, HikariCP connection pool leak detection)

---

## 🏛️ Microservice Suite Architecture

```
                                Mobile Clients (iOS / Android) & Web Frontends
                                                       │
                                                       ▼
                                      ┌─────────────────────────────────┐
                                      │     API Gateway (Port 8080)     │
                                      │  • Unified Edge Ingress         │
                                      │  • CORS & SSL Termination       │
                                      │  • Global Rate Limiting (R4j)   │
                                      │  • W3C TraceContext Generation  │
                                      └────────────────┬────────────────┘
                                                       │
         ┌───────────────────┬─────────────────────────┼─────────────────────────┬───────────────────┐
         │                   │                         │                         │                   │
         ▼                   ▼                         ▼                         ▼                   ▼
┌──────────────────┐┌──────────────────┐      ┌──────────────────┐      ┌──────────────────┐┌──────────────────┐
│  auth-tenant-srv ││   product-srv    │      │    order-srv     │      │  config-feature  ││ async-worker-srv │
│   (Port 8081)    ││   (Port 8082)    │      │   (Port 8085)    │      │   (Port 8084)    ││   (Port 8083)    │
│                  ││                  │      │                  │      │                  ││                  │
│ • Tenant Onboard ││ • Catalog CQRS   │      │ • Checkout CQRS  │      │ • Dynamic Config ││ • Rabbit Consumer│
│ • User RBAC & JWT││ • Per-Tenant     │      │ • Saga Coord     │      │ • Feature Flags  ││ • ShedLock Cron  │
│ • Mobile Version ││   Redis Cache    │      │ • Outbox Events  │      │ • Redis Pub/Sub  ││ • Outbound Web-  │
│   Policy API     ││ • Stock Reserves │      │ • Soft Deletes   │      │ • Entitlements   ││   hook Engine    │
│ • Column Crypto  ││ • Soft Deletes   │      │ • Mobile V1/V2   │      │ • Real-time Push ││ • DLQ Redrive    │
└────────┬─────────┘└────────┬─────────┘      └────────┬─────────┘      └────────┬─────────┘└────────┬─────────┘
         │                   │                         │                         │                   │
         └───────────────────┴─────────────────────────┼─────────────────────────┴───────────────────┘
                                                       │
                                                       ▼
                                   ┌────────────────────────────────────────┐
                                   │        common-starter (Chassis)        │
                                   │                                        │
                                   │ • Mobile API Versioning & Sunset Hdr   │
                                   │ • UserContext & TenantContext          │
                                   │ • CommandBus & QueryBus (CQRS)         │
                                   │ • Hibernate 6 @TenantId & Soft Deletes │
                                   │ • HikariCP Hardening & Leak Detection  │
                                   │ • W3C Distributed Tracing & Zipkin     │
                                   │ • Structured JSON Logging & PII Mask   │
                                   │ • Virtual Threads ParallelWorkExecutor │
                                   │ • Resilience4j Circuit Breakers        │
                                   └────────────────────────────────────────┘
```

---

## 📦 Multi-Module Breakdown

| Module | Port | Primary Responsibilities |
|---|---|---|
| **`common-starter`** | Library | Reusable microservice chassis: CQRS buses, W3C tracing, MDC logging, JWT filter, AES-256 column encryption, `@TenantId` base models, Virtual Threads `ParallelWorkExecutor`, and Resilience4j circuit breakers. |
| **`api-gateway`** | `8080` | Unified edge reverse proxy with path-based and host-based ingress routing, CORS, and W3C trace generation. |
| **`auth-tenant-service`** | `8081` | Tenant onboarding (`/api/v1/tenants`), User authentication & JWT tokens (`/api/v1/auth`), and Mobile Version Check / Force-Update policy (`/api/v1/app/version-check`). |
| **`product-service`** | `8082` | Product Catalog CQRS, Per-Tenant Redis caching, stock reservation (Saga step), soft deletes, and Transactional Outbox. |
| **`order-service`** | `8085` | Checkout CQRS and **Distributed Order Fulfillment Saga Orchestrator** with automated compensation rollbacks and timeline inspection (`/api/v1/sagas/{sagaId}`). |
| **`config-feature-service`** | `8084` | Hierarchical Multi-Tenant Configurations, Dynamic Feature Flags, and real-time Redis Pub/Sub change broadcasting. |
| **`async-worker-service`** | `8083` | RabbitMQ event consumers, ShedLock clustered nightly cron (`TenantDailyAuditJob`), Dynamic one-off task scheduler (`/api/v1/jobs`), Outbound Webhook dispatcher, and DLQ Redrive. |

---

## 🚀 Quick Start Guide

### 1. Start Infrastructure with Docker Compose
```bash
docker-compose up -d
```
This starts:
- **PostgreSQL 16** (`localhost:5432` with auto-created databases: `auth_db`, `product_db`, `order_db`, `config_db`, `worker_db`)
- **Redis 7** (`localhost:6379`)
- **RabbitMQ 3.12** (AMQP on `5672`, Management UI on `http://localhost:15672` user/pass: `guest`/`guest`)
- **Zipkin UI** (Distributed Tracing UI on `http://localhost:9411`)
- **Prometheus** (`http://localhost:9090`)

### 2. Build and Test the Complete Suite
```bash
mvn clean test
```

### 3. Run Microservices
You can run services individually from your IDE or via Maven:
```bash
# Terminal 1: API Gateway
cd api-gateway && mvn spring-boot:run

# Terminal 2: Auth & Tenant Service
cd auth-tenant-service && mvn spring-boot:run

# Terminal 3: Product Service
cd product-service && mvn spring-boot:run

# Terminal 4: Order Service
cd order-service && mvn spring-boot:run

# Terminal 5: Config & Feature Flag Service
cd config-feature-service && mvn spring-boot:run

# Terminal 6: Async Worker Service
cd async-worker-service && mvn spring-boot:run
```

---

## 🌐 Swagger UI & Interactive Documentation Matrix

| Service | Swagger UI URL |
|---|---|
| **API Gateway** (Unified Entry Point) | `http://localhost:8080` |
| **Auth & Tenant Service** | `http://localhost:8081/swagger-ui.html` |
| **Product Service** | `http://localhost:8082/swagger-ui.html` |
| **Config & Feature Flag Service** | `http://localhost:8084/swagger-ui.html` |
| **Order Service** | `http://localhost:8085/swagger-ui.html` |
| **Async Worker & Scheduling Service** | `http://localhost:8083/swagger-ui.html` |
| **Zipkin Distributed Tracing UI** | `http://localhost:9411` |
| **RabbitMQ Management Dashboard** | `http://localhost:15672` |

---

## 📱 Mobile API Versioning & Sunset Lifecycle

### 1. Cold Start Mobile Version Policy Check
Mobile clients check on launch:
```http
GET http://localhost:8080/api/v1/app/version-check?client=iOS&version=1.5.0
```
**Response (Force Update Required):**
```json
{
  "success": true,
  "data": {
    "status": "FORCE_UPDATE_REQUIRED",
    "clientType": "iOS",
    "clientVersion": "1.5.0",
    "minSupportedVersion": "2.0.0",
    "latestVersion": "3.0.0",
    "updateUrl": "https://apps.apple.com/app/id123456789",
    "upgradeTitle": "App Update Required",
    "upgradeMessage": "Please update to continue using the application."
  }
}
```

### 2. RFC 8594 Sunset & Deprecation Response Headers
When an outdated client invokes a `@DeprecatedApi` endpoint (`GET /api/v1/products/{id}`):
```http
HTTP/1.1 200 OK
Sunset: 2026-12-31
Deprecation: true
Link: </api/v2/products>; rel="successor-version"
Warning: 299 - "Product V1 API is deprecated. Please migrate to /api/v2/products."
```

---

## 🔄 Distributed Saga Workflow & Inspection

### 1. Place Order (Triggers 4-Step Saga)
```http
POST http://localhost:8080/api/v1/orders
Content-Type: application/json
X-Tenant-ID: acme
Idempotency-Key: idempotency-req-101

{
  "customerEmail": "buyer@example.com",
  "items": [
    {
      "sku": "SKU-LAPTOP",
      "productName": "MacBook Pro",
      "unitPrice": 1999.00,
      "quantity": 1
    }
  ]
}
```

### 2. Inspect Step-by-Step Saga Timeline & Audit Trail
```http
GET http://localhost:8080/api/v1/sagas/SAGA-ABC12345
```
**Response:**
```json
{
  "success": true,
  "data": {
    "sagaId": "SAGA-ABC12345",
    "sagaType": "ORDER_FULFILLMENT",
    "status": "COMPLETED",
    "stepLogs": [
      {
        "stepName": "Create Pending Order",
        "status": "SUCCESS",
        "executionDurationMs": 15
      },
      {
        "stepName": "Reserve Inventory in Product Service",
        "status": "SUCCESS",
        "executionDurationMs": 22
      },
      {
        "stepName": "Process Customer Payment",
        "status": "SUCCESS",
        "executionDurationMs": 45
      },
      {
        "stepName": "Confirm Order",
        "status": "SUCCESS",
        "executionDurationMs": 10
      }
    ],
    "createdAt": "2026-08-29T18:00:00Z",
    "completedAt": "2026-08-29T18:00:00.092Z"
  }
}
```

---

## 🔐 Multi-Tenant Security & Encryption

1. **Hibernate 6 `@TenantId`**: Automatically injects `WHERE tenant_id = ?` into every JPA query for entities extending `TenantAwareEntity`.
2. **Per-Tenant Redis Cache**: Keys automatically formatted as `tenant:{tenantId}:{cacheName}:{key}` via `TenantKeyGenerator`.
3. **AES-256-GCM Column Crypto**: Sensitive fields (e.g. `User.phoneNumber`) encrypted with random IV at rest in PostgreSQL via `@Convert(converter = EncryptedStringConverter.class)`.
4. **Outbound HMAC-SHA256 Webhooks**: Tenant webhooks include `X-Signature-SHA256` header calculated via `WebhookSignatureUtils`.

---

## 🛡️ Enterprise Logging & SRE Observability

1. **Structured JSON / ECS Output** (`logback-spring.xml`): Production profiles stream structured JSON with `@timestamp`, `traceId`, `spanId`, `tenantId`, `userId`, and `clientIp`.
2. **PII Masking**: `DataMaskingPatternLayout` automatically redacts passwords, tokens, and Bearer headers in logs (`password="***"`, `Bearer ***`).
3. **HikariCP Leak Detection**: Configured with `leak-detection-threshold: 2000` to immediately warn on any connection held > 2 seconds.
4. **ShedLock Distributed Locking**: Ensures nightly cron jobs (`TenantDailyAuditJob`) execute on exactly one node in a clustered Kubernetes deployment.
