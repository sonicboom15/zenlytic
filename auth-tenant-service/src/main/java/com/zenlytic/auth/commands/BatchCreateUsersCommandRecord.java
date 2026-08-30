package com.zenlytic.auth.commands;

import com.zenlytic.auth.dto.UserDto;
import com.zenlytic.common.batch.model.BatchRequest;
import com.zenlytic.common.batch.model.BatchResponse;
import com.zenlytic.common.batch.service.BatchProcessor;
import com.zenlytic.common.cqrs.command.Command;
import com.zenlytic.common.cqrs.command.CommandHandler;
import org.springframework.stereotype.Component;

public final class BatchCreateUsersCommandRecord {

    public record Command(BatchRequest<UserDto.CreateRequest> request) implements com.zenlytic.common.cqrs.command.Command<BatchResponse<UserDto.Response>> {}

    @Component
    public static class Handler implements CommandHandler<Command, BatchResponse<UserDto.Response>> {

        private final BatchProcessor batchProcessor;
        private final CreateUserCommandRecord.Handler createUserHandler;

        public Handler(BatchProcessor batchProcessor, CreateUserCommandRecord.Handler createUserHandler) {
            this.batchProcessor = batchProcessor;
            this.createUserHandler = createUserHandler;
        }

        @Override
        public BatchResponse<UserDto.Response> handle(Command command) {
            return batchProcessor.processSequential(
                    command.request(),
                    UserDto.CreateRequest::email,
                    item -> createUserHandler.handle(new CreateUserCommandRecord.Command(item))
            );
        }
    }
}

