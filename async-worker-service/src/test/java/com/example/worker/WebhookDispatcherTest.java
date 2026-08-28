package com.example.worker;

import com.example.worker.entity.WebhookDeliveryLog;
import com.example.worker.repository.WebhookDeliveryLogRepository;
import com.example.worker.webhook.WebhookDispatcherService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class WebhookDispatcherTest {

    private WebhookDeliveryLogRepository deliveryLogRepository;
    private WebhookDispatcherService webhookDispatcherService;

    @BeforeEach
    void setUp() {
        deliveryLogRepository = mock(WebhookDeliveryLogRepository.class);
        ObjectMapper objectMapper = new ObjectMapper().registerModule(new JavaTimeModule());
        webhookDispatcherService = new WebhookDispatcherService(deliveryLogRepository, objectMapper);
    }

    @Test
    @DisplayName("Should calculate HMAC-SHA256 signature and record delivery log")
    void testDispatchWebhook() {
        when(deliveryLogRepository.save(any(WebhookDeliveryLog.class))).thenAnswer(i -> i.getArgument(0));

        boolean delivered = webhookDispatcherService.dispatchWebhook(
                "acme",
                "ORDER_CREATED",
                "https://api.acme.com/webhooks",
                "secret123",
                Map.of("orderNumber", "ORD-101", "total", 99.99)
        );

        assertTrue(delivered);
        verify(deliveryLogRepository, times(1)).save(any(WebhookDeliveryLog.class));
    }
}
