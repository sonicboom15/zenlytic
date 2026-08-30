# Enterprise Multi-Tenant Spring Boot Microservice Suite — Agent & Developer Guide

This document is the single source of truth for AI agents (Antigravity, Gemini, etc.) and human engineers working in this repository. It provides an immediate, high-density reference of the system architecture, design patterns, module layout, database topology, and development runbooks.

---

## 🏛️ System Architecture Overview

This codebase is a production-grade multi-tenant microservices suite built on **Java 21 (Virtual Threads)**, **Spring Boot 3.2.5**, and **Spring Cloud 2023.0.1**.

```
                                 Client Applications (Web / iOS / Android)
                                                     │
                                                     ▼
                                     ┌───────────────────────────────┐
                                     │    API Gateway (Port 8080)    │
                                     │  • Unified Edge Routing       │
                                     │  • Global CORS & W3C Tracing  │
                                     │  • Path & Host Ingress        │
                                     └───────────────┬───────────────┘
                                                     │
        ┌───────────────────┬────────────────────────┼────────────────────────┬───────────────────┐
        │                   │                        │                        │                   │
        ▼                   ▼                        ▼                        ▼                   ▼
┌───────────────┐   ┌───────────────┐        ┌───────────────┐        ┌───────────────┐   ┌───────────────┐
│auth-tenant-srv│   │  product-srv  │        │   order-srv   │        │ config-srv    │   │async-worker-sr│
│  (Port 8081)  │   │  (Port 8082)  │        │  (Port 8085)  │        │  (Port 8084)  │   │  (Port 8083)  │
│ • Tenant Mgmt │   │ • Catalog CQRS│        │ • Order CQRS  │        │ • Multi-Tenant│   │ • RabbitMQ AMQP│
│ • JWT & RBAC  │   │ • Redis Cache │        │ • Saga Coord  │        │   Dynamic Cfg │   │ • ShedLock    │
│ • App Version │   │ • Outbox Evts │        │ • Saga Audit  │        │ • Feature Flag│   │ • Webhook HMAC│
│ • AES-256 GCM │   │ • Deprecation │        │ • Soft Delete │        │ • Redis PubSub│   │ • DLQ Redrive │
└───────┬───────┘   └───────┬───────┘        └───────┬───────┘        └───────┬───────┘   └───────┬───────┘
        │                   │                        │                        │                   │
        └───────────────────┴────────────────────────┼────────────────────────┴───────────────────┘
                                                     │
                                                     ▼
                                 ┌───────────────────────────────────────┐
                                 │       common-starter (Chassis)        │
                                 │ • CQRS (CommandBus / QueryBus)        │
                                 │ • Hibernate 6 @TenantId Isolation     │
                                 │ • Virtual Threads & MDC Propagation   │
                                 │ • AES-256 Column Encryption           │
                                 │ • RFC 8594 Sunset Header & Rate Limit │
                                 └───────────────────────────────────────┘
```

---

## 📦 Module & Port Matrix

| Module Directory | Artifact ID | HTTP Port | Primary Role & Features |
|---|---|---|---|
| **`common-starter`** | `common-starter` | *Library* | Shared chassis library. Contains CQRS buses, `TenantContextHolder`, `@TenantId` entities, AES-256 crypto, W3C tracing, Virtual Thread `ParallelWorkExecutor`, rate limiting, and `@DeprecatedApi` interceptor. |
| **`api-gateway`** | `api-gateway` | `8080` | Spring Cloud Gateway edge ingress. Routes requests to downstream microservices using path predicates (`/api/v1/...`) and virtual host headers (`auth.api.localhost`, etc.). |
| **`auth-tenant-service`** | `auth-tenant-service` | `8081` | Tenant onboarding (`/api/v1/tenants`), User authentication & JWT issuance (`/api/v1/auth`), Mobile version check & force-update policy (`/api/v1/app/version-check`). Database: `auth_db`. |
| **`product-service`** | `product-service` | `8082` | Product catalog CQRS (`/api/v1/products`), stock reservation & release for Sagas, RFC 8594 Sunset/Deprecation headers on V1 endpoints, Transactional Outbox. Database: `product_db`. |
| **`order-service`** | `order-service` | `8085` | Checkout CQRS (`/api/v1/orders`), **Distributed Order Fulfillment Saga Orchestrator** with 4-step pipeline, automated compensation rollback, and Saga timeline inspection (`/api/v1/sagas/{id}/timeline`). Database: `order_db`. |
| **`config-feature-service`**| `config-feature-service`| `8084`| Dynamic multi-tenant configurations (`/api/v1/configs`), Feature flag management & tier/percentage evaluation (`/api/v1/feature-flags`), Redis Pub/Sub broadcasting. Database: `config_db`. |
| **`async-worker-service`** | `async-worker-service` | `8083` | RabbitMQ event consumers, ShedLock clustered cron (`TenantDailyAuditJob`), dynamic task scheduler (`/api/v1/jobs`), outbound HMAC-SHA256 webhooks, Dead Letter Queue redrive (`/api/v1/dlq/redrive`). Database: `worker_db`. |
| **`e2e-playwright`** | N/A | *Node.js* | Playwright end-to-end integration test suite verifying the complete multi-tenant lifecycle against the live gateway. |

---

## 🔑 Core Design Patterns & Implementations

### 1. Multi-Tenancy Isolation
- **Row-level isolation**: JPA entities inherit `TenantAwareEntity` (annotated with Hibernate 6 `@TenantId`).
- **Context propagation**: Tenant ID is extracted from HTTP header `X-Tenant-ID` or JWT claims by `TenantFilter` and placed into `TenantContextHolder` (ThreadLocal).
- **Virtual Thread Safety**: `ParallelWorkExecutor` and `ContextPropagatingTaskDecorator` capture and restore `TenantContextHolder`, `UserContextHolder`, and `MDC` when spawning virtual threads.
- **Cache Partitioning**: Redis keys are scoped per tenant via `TenantKeyGenerator` (`tenant:{tenantId}:{cacheName}:{key}`).

### 2. CQRS (Command Query Responsibility Segregation)
- **Command Bus**: `CommandBus.dispatch(Command<R>)` dynamically routes commands to the registered `CommandHandler<C, R>`.
- **Query Bus**: `QueryBus.execute(Query<R>)` dynamically routes queries to the registered `QueryHandler<Q, R>`.
- Read and write pipelines are separated with DTO records.

### 3. Distributed Saga Orchestration
- **Base Engine**: `SagaOrchestrator` in `common-starter` executes a sequence of `SagaStep` implementations.
- **Compensation / Rollback**: If any step fails or throws an exception, `SagaOrchestrator` reverses the executed steps in LIFO order calling `step.compensate(...)`.
- **Order Fulfillment Saga**:
  1. `CreatePendingOrderStep` (Persists order in `PENDING` state)
  2. `ReserveInventoryStep` (Reserves stock in catalog; rollback releases stock)
  3. `ProcessPaymentStep` (Simulates payment charge; rollback issues refund)
  4. `ConfirmOrderStep` (Transitions order to `CONFIRMED`)
- **Audit Logs**: Every step logs execution status and duration to `SagaStepLogEntity`.

### 4. Transactional Outbox Pattern
- Database writes and event emissions occur atomically in a single PostgreSQL transaction.
- Events are saved to `outbox_events` table before publication to RabbitMQ.

### 5. Mobile Versioning & RFC 8594 Sunset Lifecycle
- **Version Check**: Cold-start API (`GET /api/v1/app/version-check?client=iOS&version=1.0.0`) evaluates min supported versions and returns update requirements (`FORCE_UPDATE_REQUIRED`, `UPDATE_AVAILABLE`, `UP_TO_DATE`).
- **Sunset Interceptor**: Annotating controllers with `@DeprecatedApi(sunsetDate = "2026-12-31", successor = "/api/v2/...")` automatically injects `Sunset`, `Deprecation`, `Link`, and `Warning` HTTP response headers via `ApiDeprecationInterceptor`.

### 6. Distributed Clustered Cron & Dynamic Scheduling
- **ShedLock**: Clustered single-execution locks (`@SchedulerLock(name = "TenantDailyAuditJob")`) prevent multiple Kubernetes replicas from running duplicate cron tasks.
- **Dynamic Scheduler**: `DynamicJobSchedulerService` registers and cancels runtime cron schedules dynamically via ThreadPoolTaskScheduler.

### 7. Security & Encryption
- **AES-256-GCM Column Crypto**: Sensitive fields (e.g. `User.phoneNumber`) use `@Convert(converter = EncryptedStringConverter.class)` to encrypt/decrypt on the fly with random IVs.
- **HMAC-SHA256 Webhooks**: Outbound webhooks are signed using `WebhookSignatureUtils` with `X-Signature-SHA256`.
- **PII Log Redaction**: `DataMaskingPatternLayout` masks Bearer tokens, passwords, and secrets in Logback outputs.

---

## 🛠️ Infrastructure & Databases

Docker Compose starts the following stack:
- **PostgreSQL 16** (`localhost:5432`): Initializes 5 logical databases (`auth_db`, `product_db`, `order_db`, `config_db`, `worker_db`) via `init-multiple-databases.sh`.
- **Redis 7** (`localhost:6379`): Per-tenant caching, rate limiting, and Pub/Sub broadcasting.
- **RabbitMQ 3.12** (`localhost:5672`, Management UI on `15672`): Asynchronous events and DLQ handling.
- **Zipkin UI** (`localhost:9411`): Distributed W3C tracing.
- **Prometheus** (`localhost:9090`): Metrics collection.

---

## 🚀 Common Commands & Runbooks

### Run Health & Architecture Audit Tool
```powershell
# PowerShell diagnostic tool
.\tools\analyze-project.ps1
```

### Build & Run Tests
```powershell
# Build entire suite without tests
.\mvnw.cmd clean package -DskipTests

# Run all unit and integration tests
.\mvnw.cmd clean test
```

### Start Infrastructure
```powershell
docker compose up -d
```

### Run End-to-End Tests
```powershell
# Option A: PowerShell automated live integration suite (9 workflows)
.\test-e2e.ps1

# Option B: Playwright test suite
cd e2e-playwright
npm test
```

---

## 🧭 Coding & Extension Guidelines for Agents

1. **Adding a New Microservice**:
   - Add `<module>` entry in root `pom.xml`.
   - Add `common-starter` dependency.
   - Configure `application.yml` with unique port, datasource, Hikari pool, and Flyway.
   - Add routing rule to `api-gateway/src/main/resources/application.yml`.
   - Add database creation to `init-multiple-databases.sh`.

2. **Creating CQRS Commands/Queries**:
   - Implement `Command<R>` or `Query<R>` interface with Java records.
   - Create corresponding `@Component` implementing `CommandHandler<Command, Result>` or `QueryHandler<Query, Result>`.
   - Inject `CommandBus` or `QueryBus` in controllers.

3. **Creating Distributed Saga Steps**:
   - Implement `SagaStep<T>` with `getStepName()`, `execute(SagaContext)`, and `compensate(SagaContext)`.
   - Ensure compensation is idempotent and handles partial failures gracefully.

