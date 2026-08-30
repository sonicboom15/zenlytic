package com.zenlytic.order;

import com.zenlytic.common.cqrs.command.CommandBus;
import com.zenlytic.common.cqrs.query.QueryBus;
import com.zenlytic.order.commands.PlaceOrderCommandRecord;
import com.zenlytic.order.controller.OrderController;
import com.zenlytic.order.controller.SagaQueryController;
import com.zenlytic.order.dto.OrderDto;
import com.zenlytic.order.dto.SagaTimelineResponseDto;
import com.zenlytic.order.queries.GetSagaTimelineQueryRecord;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class OrderControllerTest {

    private MockMvc mockMvc;
    private CommandBus commandBus;
    private QueryBus queryBus;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        commandBus = mock(CommandBus.class);
        queryBus = mock(QueryBus.class);
        objectMapper = new ObjectMapper();

        OrderController orderController = new OrderController(commandBus, queryBus);
        SagaQueryController sagaQueryController = new SagaQueryController(queryBus);

        mockMvc = MockMvcBuilders.standaloneSetup(orderController, sagaQueryController).build();
    }

    @Test
    @DisplayName("POST /api/v1/orders should place order via Saga")
    void testPlaceOrder() throws Exception {
        OrderDto.CreateRequest request = OrderDto.CreateRequest.builder()
                .items(List.of(
                        OrderDto.ItemRequest.builder()
                                .sku("SKU-100")
                                .productName("Laptop Stand")
                                .unitPrice(new BigDecimal("49.99"))
                                .quantity(1)
                                .build()
                ))
                .build();

        OrderDto.Response response = OrderDto.Response.builder()
                .orderId("ORD-987654")
                .userId("buyer-123")
                .totalAmount(new BigDecimal("49.99"))
                .status("CONFIRMED")
                .paymentReference("pay_123456")
                .tenantId("acme")
                .build();

        when(commandBus.dispatch(any(PlaceOrderCommandRecord.Command.class))).thenReturn(response);

        mockMvc.perform(post("/api/v1/orders")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.orderId").value("ORD-987654"))
                .andExpect(jsonPath("$.data.status").value("CONFIRMED"))
                .andExpect(jsonPath("$.data.totalAmount").value(49.99));
    }

    @Test
    @DisplayName("GET /api/v1/sagas/{sagaId}/timeline should return saga timeline history")
    void testGetSagaTimeline() throws Exception {
        SagaTimelineResponseDto response = SagaTimelineResponseDto.builder()
                .sagaId("SAGA-ABC123")
                .sagaType("ORDER_FULFILLMENT")
                .status("COMPLETED")
                .steps(List.of(
                        SagaTimelineResponseDto.StepLogDto.builder().stepName("Create Pending Order").status("SUCCESS").durationMs(12L).executedAt(Instant.now()).build(),
                        SagaTimelineResponseDto.StepLogDto.builder().stepName("Reserve Inventory in Product Service").status("SUCCESS").durationMs(25L).executedAt(Instant.now()).build(),
                        SagaTimelineResponseDto.StepLogDto.builder().stepName("Process Customer Payment").status("SUCCESS").durationMs(40L).executedAt(Instant.now()).build(),
                        SagaTimelineResponseDto.StepLogDto.builder().stepName("Confirm Order").status("SUCCESS").durationMs(8L).executedAt(Instant.now()).build()
                ))
                .build();

        when(queryBus.execute(any(GetSagaTimelineQueryRecord.Query.class))).thenReturn(response);

        mockMvc.perform(get("/api/v1/sagas/SAGA-ABC123/timeline"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.sagaId").value("SAGA-ABC123"))
                .andExpect(jsonPath("$.data.status").value("COMPLETED"))
                .andExpect(jsonPath("$.data.steps.length()").value(4));
    }
}
