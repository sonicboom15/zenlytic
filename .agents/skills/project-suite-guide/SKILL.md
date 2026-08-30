---
name: project-suite-guide
description: >-
  Expert engineering runbook and architectural guide for the Enterprise Multi-Tenant
  Spring Boot Microservice Suite. Use whenever creating new CQRS handlers, Distributed
  Saga steps, multi-tenant endpoints, Flyway migrations, outbox events, or running E2E tests.
---

# Project Suite Engineering Skill & Runbook

This skill provides step-by-step implementation templates and debugging runbooks for the Enterprise Multi-Tenant Spring Boot Microservice Suite.

---

## 🏛️ Microservice Suite Summary

- **JDK**: Java 21 with Virtual Threads (`Executors.newVirtualThreadPerTaskExecutor()`)
- **Framework**: Spring Boot 3.2.5, Spring Cloud Gateway 2023.0.1
- **Databases**: PostgreSQL 16 (`auth_db`, `product_db`, `order_db`, `config_db`, `worker_db`), Redis 7, RabbitMQ 3.12
- **Key Modules**:
  - `common-starter`: Chassis library (CQRS buses, Saga engine, AES crypto, TenantContext)
  - `api-gateway`: Port 8080 (Edge ingress)
  - `auth-tenant-service`: Port 8081 (Auth, Tenants, App Version check)
  - `product-service`: Port 8082 (Catalog CQRS, Outbox, Stock reservation)
  - `async-worker-service`: Port 8083 (ShedLock cron, Webhooks, DLQ redrive)
  - `config-feature-service`: Port 8084 (Dynamic tenant configs & Feature flags)
  - `order-service`: Port 8085 (Checkout CQRS & Distributed Saga Orchestrator)

---

## 📋 Standard Developer Recipes

### Recipe 1: Implementing a New CQRS Command

1. **Define the Command Record** (implementing `Command<ReturnType>`):
```java
package com.zenlytic.product.commands;

import com.zenlytic.common.cqrs.command.Command;
import com.zenlytic.product.dto.ProductDto;

public class CreateProductCommandRecord {
    public record Command(ProductDto.Request request) implements com.zenlytic.common.cqrs.command.Command<ProductDto.Response> {}
}
```

2. **Implement the CommandHandler Component**:
```java
package com.zenlytic.product.commands;

import com.zenlytic.common.cqrs.command.CommandHandler;
import com.zenlytic.product.dto.ProductDto;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class CreateProductCommandHandler implements CommandHandler<CreateProductCommandRecord.Command, ProductDto.Response> {
    
    @Override
    @Transactional
    public ProductDto.Response handle(CreateProductCommandRecord.Command command) {
        // Business logic here
        return new ProductDto.Response(...);
    }
}
```

3. **Dispatch via CommandBus in Controller**:
```java
@PostMapping("/api/v1/products")
public ResponseEntity<ApiResponse<ProductDto.Response>> createProduct(@Valid @RequestBody ProductDto.Request request) {
    ProductDto.Response response = commandBus.dispatch(new CreateProductCommandRecord.Command(request));
    return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.created("Success", response));
}
```

---

### Recipe 2: Adding a Distributed Saga Step with Compensation

1. **Implement `SagaStep<T>`**:
```java
package com.zenlytic.order.saga;

import com.zenlytic.common.saga.SagaContext;
import com.zenlytic.common.saga.SagaStep;
import org.springframework.stereotype.Component;

@Component
public class ReserveInventoryStep implements SagaStep<Void> {

    @Override
    public String getStepName() {
        return "Reserve Inventory in Product Service";
    }

    @Override
    public boolean execute(SagaContext context) {
        // 1. Perform forward action (e.g. reserve inventory)
        // 2. Put intermediate state into context if needed: context.setPayload("reservedSku", sku);
        return true; // Return false to trigger compensation rollback
    }

    @Override
    public void compensate(SagaContext context) {
        // Reverse the action (e.g. release reserved inventory)
    }
}
```

2. **Register Step in Saga Orchestrator Pipeline**:
Add the step in the constructor of `OrderFulfillmentSagaOrchestrator` in desired execution order.

---

### Recipe 3: Enforcing Multi-Tenant Row Isolation

1. **Entity definition**:
```java
@Entity
@Table(name = "products")
public class Product extends TenantAwareEntity {
    // tenantId field is automatically injected and managed by Hibernate 6 @TenantId
}
```

2. **Accessing Tenant in Business Logic**:
```java
String tenantId = TenantContextHolder.getTenantId();
```

---

### Recipe 4: Running Diagnostics and Testing

- **Architecture and Health Check**: Run `.\tools\analyze-project.ps1`
- **End-to-End Workflow Verification**: Run `.\test-e2e.ps1`
- **Playwright Test Suite**: `cd e2e-playwright && npm test`
- **Maven Unit / Integration Tests**: `.\mvnw.cmd clean test`

