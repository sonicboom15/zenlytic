package com.zenlytic.customer.queries;

import com.zenlytic.common.cqrs.query.Query;
import com.zenlytic.common.cqrs.query.QueryHandler;
import com.zenlytic.common.model.PagedResponse;
import com.zenlytic.customer.commands.CreateCustomerCommandRecord;
import com.zenlytic.customer.dto.CustomerDto;
import com.zenlytic.customer.entity.Customer;
import com.zenlytic.customer.repository.CustomerRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public final class ListCustomersQueryRecord {

    public record Query(String search, String status, String tier, int page, int size) implements com.zenlytic.common.cqrs.query.Query<PagedResponse<CustomerDto.Response>> {}

    @Component
    public static class Handler implements QueryHandler<Query, PagedResponse<CustomerDto.Response>> {

        private final CustomerRepository customerRepository;

        public Handler(CustomerRepository customerRepository) {
            this.customerRepository = customerRepository;
        }

        @Override
        @Transactional(readOnly = true)
        public PagedResponse<CustomerDto.Response> handle(Query query) {
            Pageable pageable = PageRequest.of(query.page(), query.size(), Sort.by(Sort.Direction.ASC, "name"));

            String search = (query.search() != null && !query.search().isBlank()) ? "%" + query.search().trim().toLowerCase() + "%" : null;
            String status = (query.status() != null && !query.status().isBlank()) ? query.status().trim() : null;
            String tier = (query.tier() != null && !query.tier().isBlank()) ? query.tier().trim() : null;

            Page<Customer> pageResult;
            if (search == null && status == null && tier == null) {
                pageResult = customerRepository.findAll(pageable);
            } else {
                pageResult = customerRepository.searchCustomers(search, status, tier, pageable);
            }

            List<CustomerDto.Response> items = pageResult.getContent().stream()
                    .map(CreateCustomerCommandRecord.Handler::mapToResponse)
                    .toList();

            return new PagedResponse<>(
                    items,
                    pageResult.getNumber(),
                    pageResult.getSize(),
                    pageResult.getTotalElements(),
                    pageResult.getTotalPages(),
                    pageResult.isLast(),
                    pageResult.isFirst()
            );
        }
    }
}
