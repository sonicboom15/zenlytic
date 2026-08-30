package com.zenlytic.order.commands;

import com.zenlytic.common.batch.model.BatchRequest;
import com.zenlytic.common.batch.model.BatchResponse;
import com.zenlytic.common.batch.service.BatchProcessor;
import com.zenlytic.common.cqrs.command.Command;
import com.zenlytic.common.cqrs.command.CommandHandler;
import com.zenlytic.order.dto.OrderDto;
import org.springframework.stereotype.Component;

public final class BatchPlaceOrdersCommandRecord {

    public record Command(BatchRequest<OrderDto.CreateRequest> request) implements com.zenlytic.common.cqrs.command.Command<BatchResponse<OrderDto.Response>> {}

    @Component
    public static class Handler implements CommandHandler<Command, BatchResponse<OrderDto.Response>> {

        private final BatchProcessor batchProcessor;
        private final PlaceOrderCommandRecord.Handler placeOrderHandler;

        public Handler(BatchProcessor batchProcessor, PlaceOrderCommandRecord.Handler placeOrderHandler) {
            this.batchProcessor = batchProcessor;
            this.placeOrderHandler = placeOrderHandler;
        }

        @Override
        public BatchResponse<OrderDto.Response> handle(Command command) {
            return batchProcessor.processSequential(
                    command.request(),
                    req -> req.idempotencyKey() != null ? req.idempotencyKey() : "order-batch",
                    item -> placeOrderHandler.handle(new PlaceOrderCommandRecord.Command(item))
            );
        }
    }
}

