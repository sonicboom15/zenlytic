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
