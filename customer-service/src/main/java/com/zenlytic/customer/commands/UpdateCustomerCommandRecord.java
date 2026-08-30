package com.zenlytic.customer.commands;

import com.zenlytic.common.cqrs.command.Command;
import com.zenlytic.common.cqrs.command.CommandHandler;
import com.zenlytic.common.exception.ResourceNotFoundException;
import com.zenlytic.customer.dto.CustomerDto;
import com.zenlytic.customer.entity.Customer;
import com.zenlytic.customer.repository.CustomerRepository;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

public final class UpdateCustomerCommandRecord {

    public record Command(String customerId, CustomerDto.UpdateRequest request) implements com.zenlytic.common.cqrs.command.Command<CustomerDto.Response> {}

    @Component
    public static class Handler implements CommandHandler<Command, CustomerDto.Response> {

        private final CustomerRepository customerRepository;

        public Handler(CustomerRepository customerRepository) {
            this.customerRepository = customerRepository;
        }

        @Override
        @Transactional
        public CustomerDto.Response handle(Command command) {
            Customer customer = customerRepository.findByCustomerId(command.customerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + command.customerId()));

            CustomerDto.UpdateRequest req = command.request();

            if (req.name() != null) customer.setName(req.name());
            if (req.companyName() != null) customer.setCompanyName(req.companyName());
            if (req.email() != null) customer.setEmail(req.email());
            if (req.phone() != null) customer.setPhone(req.phone());
            if (req.taxId() != null) customer.setTaxId(req.taxId());
            if (req.billingAddress() != null) customer.setBillingAddress(req.billingAddress());
            if (req.shippingAddress() != null) customer.setShippingAddress(req.shippingAddress());
            if (req.creditLimit() != null) customer.setCreditLimit(req.creditLimit());
            if (req.currentBalance() != null) customer.setCurrentBalance(req.currentBalance());
            if (req.maxDiscountPercentage() != null) customer.setMaxDiscountPercentage(req.maxDiscountPercentage());
            if (req.tier() != null) customer.setTier(req.tier());
            if (req.status() != null) customer.setStatus(req.status());
            if (req.notes() != null) customer.setNotes(req.notes());

            Customer updated = customerRepository.save(customer);
            return CreateCustomerCommandRecord.Handler.mapToResponse(updated);
        }
    }
}

