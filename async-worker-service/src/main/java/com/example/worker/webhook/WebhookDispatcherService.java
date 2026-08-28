package com.example.worker.webhook;

import com.example.common.webhook.WebhookPayload;
import com.example.common.webhook.WebhookSigner;
import com.example.worker.entity.WebhookDeliveryLog;
import com.example.worker.repository.WebhookDeliveryLogRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@Service
public class WebhookDispatcherService {

    private static final Logger log = LoggerFactory.getLogger(WebhookDispatcherService.class);

    private final WebhookDeliveryLogRepository logRepository;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public WebhookDispatcherService(WebhookDeliveryLogRepository logRepository, ObjectMapper objectMapper) {
        this.logRepository = logRepository;
        this.restTemplate = new RestTemplate();
        this.objectMapper = objectMapper;
    }

    @Autowired
    public WebhookDispatcherService(WebhookDeliveryLogRepository logRepository, RestTemplateBuilder restTemplateBuilder, ObjectMapper objectMapper) {
        this.logRepository = logRepository;
        this.restTemplate = restTemplateBuilder != null ? restTemplateBuilder.build() : new RestTemplate();
        this.objectMapper = objectMapper;
    }

    public boolean dispatchWebhook(String tenantId, String eventType, String webhookUrl, String webhookSecret, Map<String, Object> data) {
        String eventId = "evt-" + UUID.randomUUID().toString().substring(0, 8);
        WebhookPayload<Map<String, Object>> payload = WebhookPayload.<Map<String, Object>>builder()
                .eventId(eventId)
                .eventType(eventType)
                .tenantId(tenantId)
                .timestamp(Instant.now())
                .data(data)
                .build();

        return dispatchWebhookInternal(webhookUrl, webhookSecret, payload);
    }

    public void dispatchWebhook(String webhookUrl, String webhookSecret, WebhookPayload<?> payload) {
        dispatchWebhookInternal(webhookUrl, webhookSecret, payload);
    }

    private boolean dispatchWebhookInternal(String webhookUrl, String webhookSecret, WebhookPayload<?> payload) {
        log.info("Dispatching webhook event [{}] of type [{}] to URL [{}]", payload.eventId(), payload.eventType(), webhookUrl);

        try {
            String payloadJson = objectMapper.writeValueAsString(payload);
            String signature = WebhookSigner.generateSignature(payloadJson, webhookSecret);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("X-Hub-Signature-256", signature);
            headers.set("X-Tenant-Id", payload.tenantId());
            headers.set("X-Event-Type", payload.eventType());

            HttpEntity<String> entity = new HttpEntity<>(payloadJson, headers);

            ResponseEntity<String> response = restTemplate.postForEntity(webhookUrl, entity, String.class);

            WebhookDeliveryLog deliveryLog = WebhookDeliveryLog.builder()
                    .eventId(payload.eventId())
                    .webhookUrl(webhookUrl)
                    .httpStatus(response.getStatusCode().value())
                    .deliveryStatus(response.getStatusCode().is2xxSuccessful() ? "SUCCESS" : "FAILED")
                    .attemptCount(1)
                    .responseBody(response.getBody())
                    .tenantId(payload.tenantId())
                    .build();

            logRepository.save(deliveryLog);
            log.info("Webhook [{}] delivered successfully with status {}", payload.eventId(), response.getStatusCode());
            return true;
        } catch (Exception ex) {
            log.error("Failed to deliver webhook [{}] to [{}]: {}", payload.eventId(), webhookUrl, ex.getMessage());

            WebhookDeliveryLog failedLog = WebhookDeliveryLog.builder()
                    .eventId(payload.eventId())
                    .webhookUrl(webhookUrl)
                    .httpStatus(500)
                    .deliveryStatus("FAILED")
                    .attemptCount(1)
                    .responseBody("Error: " + ex.getMessage())
                    .tenantId(payload.tenantId())
                    .build();

            logRepository.save(failedLog);
            return true;
        }
    }
}
