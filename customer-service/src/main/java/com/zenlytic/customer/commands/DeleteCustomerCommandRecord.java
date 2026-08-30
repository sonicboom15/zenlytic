package com.zenlytic.customer.commands;

import com.zenlytic.common.cqrs.command.Command;
import com.zenlytic.common.cqrs.command.CommandHandler;
import com.zenlytic.common.exception.ResourceNotFoundException;
import com.zenlytic.customer.entity.Customer;
import com.zenlytic.customer.repository.CustomerRepository;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

public final class DeleteCustomerCommandRecord {

    public record Command(String customerId) implements com.zenlytic.common.cqrs.command.Command<Void> {}

    @Component
    public static class Handler implements CommandHandler<Command, Void> {

        private final CustomerRepository customerRepository;

        public Handler(CustomerRepository customerRepository) {
            this.customerRepository = customerRepository;
        }

        @Override
        @Transactional
        public Void handle(Command command) {
            Customer customer = customerRepository.findByCustomerId(command.customerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + command.customerId()));

            customer.setStatus("INACTIVE");
            customerRepository.save(customer);
            return null;
        }
    }
}

