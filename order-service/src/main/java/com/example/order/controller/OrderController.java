package com.example.order.controller;

import com.example.common.cqrs.command.CommandBus;
import com.example.common.cqrs.query.QueryBus;
import com.example.common.featureflag.RequiresFeature;
import com.example.common.idempotency.Idempotent;
import com.example.common.logging.audit.Auditable;
import com.example.common.model.ApiResponse;
import com.example.order.commands.PlaceOrderCommandRecord;
import com.example.order.dto.OrderDto;
import com.example.order.dto.SagaTimelineResponseDto;
import com.example.order.queries.GetOrderByIdQueryRecord;
import com.example.order.queries.GetSagaTimelineQueryRecord;
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
