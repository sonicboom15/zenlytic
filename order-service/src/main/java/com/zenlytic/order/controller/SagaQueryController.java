package com.zenlytic.order.controller;

import com.zenlytic.common.cqrs.query.QueryBus;
import com.zenlytic.common.model.ApiResponse;
import com.zenlytic.order.dto.SagaTimelineResponseDto;
import com.zenlytic.order.queries.GetSagaTimelineQueryRecord;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/sagas")
@Tag(name = "Sagas", description = "Distributed Saga Observability and Step Timeline Audit APIs")
public class SagaQueryController {

    private final QueryBus queryBus;

    public SagaQueryController(QueryBus queryBus) {
        this.queryBus = queryBus;
    }

    @GetMapping("/{sagaId}/timeline")
    @Operation(summary = "Get full timeline and compensation audit logs for a distributed saga execution")
    public ResponseEntity<ApiResponse<SagaTimelineResponseDto>> getSagaTimeline(@PathVariable String sagaId) {
        SagaTimelineResponseDto response = queryBus.execute(new GetSagaTimelineQueryRecord.Query(sagaId));
        return ResponseEntity.ok(ApiResponse.ok("Saga timeline retrieved", response));
    }
}
