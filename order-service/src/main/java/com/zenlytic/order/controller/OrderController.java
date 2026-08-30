package com.zenlytic.order.controller;

import com.zenlytic.common.cqrs.command.CommandBus;
import com.zenlytic.common.cqrs.query.QueryBus;
import com.zenlytic.common.featureflag.RequiresFeature;
import com.zenlytic.common.idempotency.Idempotent;
import com.zenlytic.common.logging.audit.Auditable;
import com.zenlytic.common.model.ApiResponse;
import com.zenlytic.order.commands.PlaceOrderCommandRecord;
import com.zenlytic.order.dto.OrderDto;
import com.zenlytic.order.dto.SagaTimelineResponseDto;
import com.zenlytic.order.queries.GetOrderByIdQueryRecord;
import com.zenlytic.order.queries.GetSagaTimelineQueryRecord;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/orders")
@Tag(name = "Orders", description = "Multi-Tenant Order Orchestration & Saga Checkout APIs")
public class OrderController {

    private final CommandBus commandBus;
    private final QueryBus queryBus;

    public OrderController(CommandBus commandBus, QueryBus queryBus) {
        this.commandBus = commandBus;
        this.queryBus = queryBus;
    }

    @PostMapping
    @Idempotent(ttlSeconds = 300)
    @RequiresFeature("ORDER_MANAGEMENT")
    @Auditable(action = "PLACE_ORDER", resource = "ORDER")
    @Operation(summary = "Place order through multi-service Distributed Saga Orchestration")
    public ResponseEntity<ApiResponse<OrderDto.Response>> placeOrder(@Valid @RequestBody OrderDto.CreateRequest request) {
        OrderDto.Response response = commandBus.dispatch(new PlaceOrderCommandRecord.Command(request));
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created("Order placed and orchestrated successfully", response));
    }

    @PostMapping("/batch")
    @Auditable(action = "BATCH_PLACE_ORDERS", resource = "ORDER")
    @Operation(summary = "Batch place orders and orchestrate sagas")
    public ResponseEntity<ApiResponse<com.zenlytic.common.batch.model.BatchResponse<OrderDto.Response>>> batchPlaceOrders(
            @Valid @RequestBody com.zenlytic.common.batch.model.BatchRequest<OrderDto.CreateRequest> request) {
        com.zenlytic.common.batch.model.BatchResponse<OrderDto.Response> response = commandBus.dispatch(new com.zenlytic.order.commands.BatchPlaceOrdersCommandRecord.Command(request));
        return ResponseEntity.ok(ApiResponse.ok("Batch orders processed", response));
    }

    @GetMapping
    @Operation(summary = "List orders paged with optional filters for status, customerId, or search")
    public ResponseEntity<ApiResponse<com.zenlytic.common.model.PagedResponse<OrderDto.Response>>> listOrders(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String customerId,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        com.zenlytic.common.model.PagedResponse<OrderDto.Response> response = queryBus.execute(
                new com.zenlytic.order.queries.ListOrdersQueryRecord.Query(status, customerId, search, page, size));
        return ResponseEntity.ok(ApiResponse.ok("Orders list retrieved", response));
    }

    @GetMapping("/{orderId}")
    @Operation(summary = "Get order details by order ID")
    public ResponseEntity<ApiResponse<OrderDto.Response>> getOrder(@PathVariable String orderId) {
        OrderDto.Response response = queryBus.execute(new GetOrderByIdQueryRecord.Query(orderId));
        return ResponseEntity.ok(ApiResponse.ok("Order retrieved", response));
    }

    @GetMapping("/sagas/{sagaId}/timeline")
    @Operation(summary = "Get saga timeline by saga ID")
    public ResponseEntity<ApiResponse<SagaTimelineResponseDto>> getSagaTimeline(@PathVariable String sagaId) {
        SagaTimelineResponseDto response = queryBus.execute(new GetSagaTimelineQueryRecord.Query(sagaId));
        return ResponseEntity.ok(ApiResponse.ok("Saga timeline retrieved", response));
    }
}
