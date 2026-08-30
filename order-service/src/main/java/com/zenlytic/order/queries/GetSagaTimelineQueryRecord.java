package com.zenlytic.order.queries;

import com.zenlytic.common.cqrs.query.Query;
import com.zenlytic.common.cqrs.query.QueryHandler;
import com.zenlytic.common.exception.ResourceNotFoundException;
import com.zenlytic.order.dto.SagaTimelineResponseDto;
import com.zenlytic.order.entity.SagaInstanceEntity;
import com.zenlytic.order.repository.SagaInstanceRepository;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

public class GetSagaTimelineQueryRecord {

    public record Query(String sagaId) implements com.zenlytic.common.cqrs.query.Query<SagaTimelineResponseDto> {}

    @Component
    public static class Handler implements QueryHandler<Query, SagaTimelineResponseDto> {

        private final SagaInstanceRepository sagaRepository;

        public Handler(SagaInstanceRepository sagaRepository) {
            this.sagaRepository = sagaRepository;
        }

        @Override
        public SagaTimelineResponseDto handle(Query query) {
            SagaInstanceEntity saga = sagaRepository.findBySagaId(query.sagaId())
                    .orElseThrow(() -> new ResourceNotFoundException("SagaInstance", "sagaId", query.sagaId()));

            return SagaTimelineResponseDto.builder()
                    .sagaId(saga.getSagaId())
                    .sagaType(saga.getSagaType())
                    .tenantId(saga.getTenantId())
                    .status(saga.getStatus())
                    .currentStep(saga.getCurrentStep())
                    .failureReason(saga.getFailureReason())
                    .createdAt(saga.getCreatedAt())
                    .steps(saga.getStepLogs().stream().map(s -> SagaTimelineResponseDto.StepLogDto.builder()
                            .stepName(s.getStepName())
                            .status(s.getStatus())
                            .durationMs(s.getDurationMs())
                            .errorMessage(s.getErrorMessage())
                            .executedAt(s.getExecutedAt())
                            .build()).collect(Collectors.toList()))
                    .build();
        }
    }
}
