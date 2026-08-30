package com.zenlytic.auth.queries;

import com.zenlytic.auth.dto.TenantResponseDto;
import com.zenlytic.auth.entity.Tenant;
import com.zenlytic.auth.repository.TenantRepository;
import com.zenlytic.common.cqrs.query.Query;
import com.zenlytic.common.cqrs.query.QueryHandler;
import com.zenlytic.common.exception.TenantNotFoundException;
import org.springframework.stereotype.Component;

public class GetTenantByIdQueryRecord {

    public record Query(String tenantId) implements com.zenlytic.common.cqrs.query.Query<TenantResponseDto> {}

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
