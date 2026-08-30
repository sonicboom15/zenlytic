package com.zenlytic.product;

import com.zenlytic.common.cqrs.command.CommandBus;
import com.zenlytic.common.cqrs.query.QueryBus;
import com.zenlytic.common.versioning.ApiDeprecationInterceptor;
import com.zenlytic.product.commands.ReserveStockCommandRecord;
import com.zenlytic.product.controller.ProductController;
import com.zenlytic.product.dto.ProductDto;
import com.zenlytic.product.queries.GetProductByIdQueryRecord;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.math.BigDecimal;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class ProductControllerTest {

    private MockMvc mockMvc;
    private CommandBus commandBus;
    private QueryBus queryBus;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        commandBus = mock(CommandBus.class);
        queryBus = mock(QueryBus.class);
        objectMapper = new ObjectMapper();
        ProductController productController = new ProductController(commandBus, queryBus);

        mockMvc = MockMvcBuilders.standaloneSetup(productController)
                .addInterceptors(new ApiDeprecationInterceptor())
                .build();
    }

    @Test
    @DisplayName("GET /api/v1/products/{id} should return Sunset & Deprecation headers")
    void testGetProductV1DeprecationHeaders() throws Exception {
        ProductDto.Response response = ProductDto.Response.builder()
                .id(1L)
                .sku("SKU-100")
                .name("Wireless Mouse")
                .price(new BigDecimal("29.99"))
                .stockQuantity(50)
                .availableStock(50)
                .build();

        when(queryBus.execute(any(GetProductByIdQueryRecord.Query.class))).thenReturn(response);

        mockMvc.perform(get("/api/v1/products/1"))
                .andExpect(status().isOk())
                .andExpect(header().exists("Sunset"))
                .andExpect(header().exists("Deprecation"))
                .andExpect(header().string("Sunset", "2026-12-31"))
                .andExpect(jsonPath("$.data.sku").value("SKU-100"));
    }

    @Test
    @DisplayName("POST /api/v1/products/reserve-stock should reserve stock")
    void testReserveStock() throws Exception {
        ProductDto.ReserveStockRequest request = ProductDto.ReserveStockRequest.builder()
                .sku("SKU-100")
                .quantity(2)
                .orderId("ord-789")
                .build();

        ProductDto.ReserveStockResponse response = ProductDto.ReserveStockResponse.builder()
                .reserved(true)
                .sku("SKU-100")
                .quantityReserved(2)
                .message("Stock reserved successfully")
                .build();

        when(commandBus.dispatch(any(ReserveStockCommandRecord.Command.class))).thenReturn(response);

        mockMvc.perform(post("/api/v1/products/reserve-stock")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.reserved").value(true))
                .andExpect(jsonPath("$.data.quantityReserved").value(2));
    }
}
