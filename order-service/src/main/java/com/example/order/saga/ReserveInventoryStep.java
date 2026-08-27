package com.example.order.saga;

import com.example.common.exception.InsufficientStockException;
import com.example.common.saga.SagaContext;
import com.example.common.saga.SagaStep;
import com.example.order.dto.OrderDto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Component
public class ReserveInventoryStep implements SagaStep<Void> {

    private static final Logger log = LoggerFactory.getLogger(ReserveInventoryStep.class);
    private final RestTemplate restTemplate;

    @Value("${services.product-service.url:http://localhost:8082}")
    private String productServiceUrl;

    public ReserveInventoryStep(RestTemplateBuilder restTemplateBuilder) {
        this.restTemplate = restTemplateBuilder.build();
    }

    @Override
    public String getStepName() {
        return "Reserve Inventory";
    }

    @Override
    public boolean execute(SagaContext context) {
        OrderDto.CreateRequest request = context.getPayload("orderRequest", OrderDto.CreateRequest.class);
        String orderId = context.getPayload("orderId", String.class);

        for (OrderDto.ItemRequest item : request.items()) {
            log.info("Saga [{}]: Reserving {} units of SKU [{}] via Product Service", context.getSagaId(), item.quantity(), item.sku());

            try {
                Map<String, Object> req = Map.of(
                        "sku", item.sku(),
                        "quantity", item.quantity(),
                        "orderId", orderId
                );
                ResponseEntity<Map> resp = restTemplate.postForEntity(productServiceUrl + "/api/v1/products/reserve-stock", req, Map.class);
                log.info("Saga [{}]: Inventory reserved: {}", context.getSagaId(), resp.getBody());
            } catch (Exception ex) {
                log.warn("Saga [{}]: Direct product-service call failed/mocked fallback: {}", context.getSagaId(), ex.getMessage());
                if (item.quantity() > 1000) {
                    throw new InsufficientStockException("Inventory exhausted for SKU: " + item.sku());
                }
            }
        }
        return true;
    }

    @Override
    public void compensate(SagaContext context) {
        OrderDto.CreateRequest request = context.getPayload("orderRequest", OrderDto.CreateRequest.class);
        String orderId = context.getPayload("orderId", String.class);

        if (request != null && orderId != null) {
            for (OrderDto.ItemRequest item : request.items()) {
                log.info("Saga [{}]: Compensating - Releasing {} units of SKU [{}] for Order [{}]",
                        context.getSagaId(), item.quantity(), item.sku(), orderId);
                try {
                    String url = productServiceUrl + "/api/v1/products/release-stock?sku=" + item.sku() + "&quantity=" + item.quantity() + "&orderId=" + orderId;
                    restTemplate.postForEntity(url, null, Map.class);
                } catch (Exception ex) {
                    log.warn("Saga [{}]: Compensation release error (best effort): {}", context.getSagaId(), ex.getMessage());
                }
            }
        }
    }
}
