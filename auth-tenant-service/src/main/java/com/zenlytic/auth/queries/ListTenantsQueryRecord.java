package com.zenlytic.auth.queries;

import com.zenlytic.auth.dto.TenantResponseDto;
import com.zenlytic.auth.entity.Tenant;
import com.zenlytic.auth.repository.TenantRepository;
import com.zenlytic.common.cqrs.query.Query;
import com.zenlytic.common.cqrs.query.QueryHandler;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public final class ListTenantsQueryRecord {

    public record Query() implements com.zenlytic.common.cqrs.query.Query<List<TenantResponseDto>> {}

    @Component
    public static class Handler implements QueryHandler<Query, List<TenantResponseDto>> {

        private final TenantRepository tenantRepository;

        public Handler(TenantRepository tenantRepository) {
            this.tenantRepository = tenantRepository;
        }

        @Override
        @Transactional(readOnly = true)
        public List<TenantResponseDto> handle(Query query) {
            List<Tenant> tenants = tenantRepository.findAll();
            return tenants.stream()
                    .map(t -> new TenantResponseDto(
                            t.getTenantId(),
                            t.getName(),
                            t.getTier(),
                            t.getStatus(),
                            null,
                            t.getCreatedAt()
                    ))
                    .toList();
        }
    }
}

