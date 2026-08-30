package com.zenlytic.customer.commands;

import com.zenlytic.common.batch.model.BatchRequest;
import com.zenlytic.common.batch.model.BatchResponse;
import com.zenlytic.common.batch.service.BatchProcessor;
import com.zenlytic.common.cqrs.command.Command;
import com.zenlytic.common.cqrs.command.CommandHandler;
import com.zenlytic.customer.dto.CustomerDto;
import org.springframework.stereotype.Component;

public final class BatchCreateCustomersCommandRecord {

    public record Command(BatchRequest<CustomerDto.CreateRequest> request) implements com.zenlytic.common.cqrs.command.Command<BatchResponse<CustomerDto.Response>> {}

    @Component
    public static class Handler implements CommandHandler<Command, BatchResponse<CustomerDto.Response>> {

        private final BatchProcessor batchProcessor;
        private final CreateCustomerCommandRecord.Handler createCustomerHandler;

        public Handler(BatchProcessor batchProcessor, CreateCustomerCommandRecord.Handler createCustomerHandler) {
            this.batchProcessor = batchProcessor;
            this.createCustomerHandler = createCustomerHandler;
        }

        @Override
        public BatchResponse<CustomerDto.Response> handle(Command command) {
            return batchProcessor.processSequential(
                    command.request(),
                    CustomerDto.CreateRequest::code,
                    item -> createCustomerHandler.handle(new CreateCustomerCommandRecord.Command(item))
            );
        }
    }
}

