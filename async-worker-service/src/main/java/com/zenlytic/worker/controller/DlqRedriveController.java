package com.zenlytic.worker.controller;

import com.zenlytic.common.model.ApiResponse;
import com.zenlytic.worker.dlq.DlqRedriveService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/dlq")
@Tag(name = "Dead Letter Queue Redrive", description = "Operational DLQ replay and recovery APIs")
public class DlqRedriveController {

    private final DlqRedriveService dlqRedriveService;

    public DlqRedriveController(DlqRedriveService dlqRedriveService) {
        this.dlqRedriveService = dlqRedriveService;
    }

    @PostMapping("/redrive")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Replay dead-letter queue messages back into primary processing topic")
    public ResponseEntity<ApiResponse<Map<String, Object>>> redriveDlq(
            @RequestParam(defaultValue = "orders.dlq") String dlqTopic,
            @RequestParam(defaultValue = "orders.events") String targetTopic,
            @RequestParam(defaultValue = "100") int maxMessages) {

        int replayedCount = dlqRedriveService.redriveMessages(dlqTopic, targetTopic, maxMessages);

        Map<String, Object> result = Map.of(
                "dlqTopic", dlqTopic,
                "targetTopic", targetTopic,
                "replayedCount", replayedCount
        );

        return ResponseEntity.ok(ApiResponse.ok("DLQ messages redriven successfully", result));
    }
}
