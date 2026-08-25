package com.example.auth.queries;

import com.example.auth.dto.TenantResponseDto;
import com.example.auth.entity.Tenant;
import com.example.auth.repository.TenantRepository;
import com.example.common.cqrs.query.Query;
import com.example.common.cqrs.query.QueryHandler;
import com.example.common.exception.TenantNotFoundException;
import org.springframework.stereotype.Component;

public class GetTenantByIdQueryRecord {

    public record Query(String tenantId) implements com.example.common.cqrs.query.Query<TenantResponseDto> {}

    @Component
    public static class Handler implements QueryHandler<Query, TenantResponseDto> {

        private final TenantRepository tenantRepository;

        public Handler(TenantRepository tenantRepository) {
            this.tenantRepository = tenantRepository;
        }

        @Override
        public TenantResponseDto handle(Query query) {
            Tenant tenant = tenantRepository.findByTenantId(query.tenantId())
                    .orElseThrow(() -> new TenantNotFoundException("Tenant not found: " + query.tenantId()));

            return TenantResponseDto.builder()
                    .tenantId(tenant.getTenantId())
                    .name(tenant.getName())
                    .tier(tenant.getTier())
                    .status(tenant.getStatus())
                    .createdAt(tenant.getCreatedAt())
                    .build();
        }
    }
}
