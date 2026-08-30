package com.zenlytic.product.controller;

import com.zenlytic.common.cqrs.command.CommandBus;
import com.zenlytic.common.cqrs.query.QueryBus;
import com.zenlytic.common.featureflag.RequiresFeature;
import com.zenlytic.common.idempotency.Idempotent;
import com.zenlytic.common.logging.audit.Auditable;
import com.zenlytic.common.model.ApiResponse;
import com.zenlytic.common.model.PagedResponse;
import com.zenlytic.common.versioning.DeprecatedApi;
import com.zenlytic.product.commands.CreateProductCommandRecord;
import com.zenlytic.product.commands.ReleaseStockCommandRecord;
import com.zenlytic.product.commands.ReserveStockCommandRecord;
import com.zenlytic.product.dto.ProductDto;
import com.zenlytic.product.queries.GetProductByIdQueryRecord;
import com.zenlytic.product.queries.ListProductsQueryRecord;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@Tag(name = "Products", description = "Product Catalog, CQRS, and Stock Management APIs")
public class ProductController {

    private final CommandBus commandBus;
    private final QueryBus queryBus;

    public ProductController(CommandBus commandBus, QueryBus queryBus) {
        this.commandBus = commandBus;
        this.queryBus = queryBus;
    }

    // V1 Endpoint with RFC 8594 Sunset Header
    @DeprecatedApi(sunsetDate = "2026-12-31", successor = "/api/v2/products", message = "Product V1 API is deprecated. Please migrate to /api/v2/products.")
    @GetMapping("/api/v1/products/{id}")
    @Operation(summary = "Get product by ID (V1 Deprecated)")
    public ResponseEntity<ApiResponse<ProductDto.Response>> getProductV1(@PathVariable Long id) {
        ProductDto.Response response = queryBus.execute(new GetProductByIdQueryRecord.Query(id));
        return ResponseEntity.ok(ApiResponse.ok("Product retrieved (V1)", response));
    }

    // V2 Endpoint
    @GetMapping("/api/v2/products/{id}")
    @Operation(summary = "Get product by ID (V2)")
    public ResponseEntity<ApiResponse<ProductDto.Response>> getProductV2(@PathVariable Long id) {
        ProductDto.Response response = queryBus.execute(new GetProductByIdQueryRecord.Query(id));
        return ResponseEntity.ok(ApiResponse.ok("Product retrieved (V2)", response));
    }

    @GetMapping({"/api/v1/products", "/api/v2/products"})
    @Operation(summary = "List products paged")
    public ResponseEntity<ApiResponse<PagedResponse<ProductDto.Response>>> listProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        PagedResponse<ProductDto.Response> response = queryBus.execute(new ListProductsQueryRecord.Query(page, size));
        return ResponseEntity.ok(ApiResponse.ok("Products list retrieved", response));
    }

    @PostMapping({"/api/v1/products", "/api/v2/products"})
    @Idempotent(ttlSeconds = 300)
    @RequiresFeature("PRODUCT_CATALOG")
    @Auditable(action = "CREATE_PRODUCT", resource = "PRODUCT")
    @PreAuthorize("hasAuthority('product:write') or hasRole('ADMIN')")
    @Operation(summary = "Create product (Idempotent with Outbox event)")
    public ResponseEntity<ApiResponse<ProductDto.Response>> createProduct(@Valid @RequestBody ProductDto.Request request) {
        ProductDto.Response response = commandBus.dispatch(new CreateProductCommandRecord.Command(request));
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created("Product created successfully", response));
    }

    @PostMapping("/api/v1/products/reserve-stock")
    @Operation(summary = "Reserve stock for an order (Distributed Saga step)")
    public ResponseEntity<ApiResponse<ProductDto.ReserveStockResponse>> reserveStock(@Valid @RequestBody ProductDto.ReserveStockRequest request) {
        ProductDto.ReserveStockResponse response = commandBus.dispatch(new ReserveStockCommandRecord.Command(request));
        return ResponseEntity.ok(ApiResponse.ok(response.message(), response));
    }

    @PostMapping("/api/v1/products/release-stock")
    @Operation(summary = "Release reserved stock (Distributed Saga compensation)")
    public ResponseEntity<ApiResponse<Void>> releaseStock(
            @RequestParam String sku,
            @RequestParam int quantity,
            @RequestParam String orderId) {
        commandBus.dispatch(new ReleaseStockCommandRecord.Command(sku, quantity, orderId));
        return ResponseEntity.ok(ApiResponse.ok("Stock released successfully", null));
    }
}
