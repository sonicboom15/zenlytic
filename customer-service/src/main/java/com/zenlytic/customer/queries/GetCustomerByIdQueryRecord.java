package com.zenlytic.customer.queries;

import com.zenlytic.common.cqrs.query.Query;
import com.zenlytic.common.cqrs.query.QueryHandler;
import com.zenlytic.common.exception.ResourceNotFoundException;
import com.zenlytic.customer.commands.CreateCustomerCommandRecord;
import com.zenlytic.customer.dto.CustomerDto;
import com.zenlytic.customer.entity.Customer;
import com.zenlytic.customer.repository.CustomerRepository;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

public final class GetCustomerByIdQueryRecord {

    public record Query(String customerId) implements com.zenlytic.common.cqrs.query.Query<CustomerDto.Response> {}

    @Component
    public static class Handler implements QueryHandler<Query, CustomerDto.Response> {

        private final CustomerRepository customerRepository;

        public Handler(CustomerRepository customerRepository) {
            this.customerRepository = customerRepository;
        }

        @Override
        @Transactional(readOnly = true)
        public CustomerDto.Response handle(Query query) {
            Customer customer = customerRepository.findByCustomerId(query.customerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + query.customerId()));

            return CreateCustomerCommandRecord.Handler.mapToResponse(customer);
        }
    }
}

