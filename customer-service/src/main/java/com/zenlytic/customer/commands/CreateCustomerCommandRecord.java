package com.zenlytic.customer.commands;

import com.zenlytic.common.cqrs.command.Command;
import com.zenlytic.common.cqrs.command.CommandHandler;
import com.zenlytic.common.exception.ConflictException;
import com.zenlytic.customer.dto.CustomerDto;
import com.zenlytic.customer.entity.Customer;
import com.zenlytic.customer.repository.CustomerRepository;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.UUID;

public final class CreateCustomerCommandRecord {

    public record Command(CustomerDto.CreateRequest request) implements com.zenlytic.common.cqrs.command.Command<CustomerDto.Response> {}

    @Component
    public static class Handler implements CommandHandler<Command, CustomerDto.Response> {

        private final CustomerRepository customerRepository;

        public Handler(CustomerRepository customerRepository) {
            this.customerRepository = customerRepository;
        }

        @Override
        @Transactional
        public CustomerDto.Response handle(Command command) {
            CustomerDto.CreateRequest req = command.request();

            if (customerRepository.existsByCode(req.code())) {
                throw new ConflictException("Customer with code '" + req.code() + "' already exists");
            }

            String customerId = "cust-" + UUID.randomUUID().toString().substring(0, 8);

            Customer customer = new Customer(
                    customerId,
                    req.name(),
                    req.code(),
                    req.companyName(),
                    req.email(),
                    req.phone(),
                    req.taxId(),
                    req.billingAddress(),
                    req.shippingAddress(),
                    req.creditLimit() != null ? req.creditLimit() : new BigDecimal("10000.00"),
                    BigDecimal.ZERO,
                    req.maxDiscountPercentage() != null ? req.maxDiscountPercentage() : new BigDecimal("15.00"),
                    req.tier() != null ? req.tier() : "STANDARD",
                    req.status() != null ? req.status() : "ACTIVE",
                    req.notes()
            );

            Customer saved = customerRepository.save(customer);
            return mapToResponse(saved);
        }

        public static CustomerDto.Response mapToResponse(Customer c) {
            BigDecimal creditLimit = c.getCreditLimit() != null ? c.getCreditLimit() : BigDecimal.ZERO;
            BigDecimal currentBal = c.getCurrentBalance() != null ? c.getCurrentBalance() : BigDecimal.ZERO;
            BigDecimal available = creditLimit.subtract(currentBal);

            return new CustomerDto.Response(
                    c.getCustomerId(),
                    c.getTenantId(),
                    c.getName(),
                    c.getCode(),
                    c.getCompanyName(),
                    c.getEmail(),
                    c.getPhone(),
                    c.getTaxId(),
                    c.getBillingAddress(),
                    c.getShippingAddress(),
                    creditLimit,
                    currentBal,
                    available,
                    c.getMaxDiscountPercentage(),
                    c.getTier(),
                    c.getStatus(),
                    c.getNotes(),
                    c.getCreatedAt(),
                    c.getUpdatedAt()
            );
        }
    }
}

