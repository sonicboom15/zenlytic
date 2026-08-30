package com.zenlytic.product.commands;

import com.zenlytic.common.batch.model.BatchRequest;
import com.zenlytic.common.batch.model.BatchResponse;
import com.zenlytic.common.batch.service.BatchProcessor;
import com.zenlytic.common.cqrs.command.Command;
import com.zenlytic.common.cqrs.command.CommandHandler;
import com.zenlytic.product.dto.ProductDto;
import org.springframework.stereotype.Component;

public final class BatchCreateProductsCommandRecord {

    public record Command(BatchRequest<ProductDto.Request> request) implements com.zenlytic.common.cqrs.command.Command<BatchResponse<ProductDto.Response>> {}

    @Component
    public static class Handler implements CommandHandler<Command, BatchResponse<ProductDto.Response>> {

        private final BatchProcessor batchProcessor;
        private final CreateProductCommandRecord.Handler createProductHandler;

        public Handler(BatchProcessor batchProcessor, CreateProductCommandRecord.Handler createProductHandler) {
            this.batchProcessor = batchProcessor;
            this.createProductHandler = createProductHandler;
        }

        @Override
        public BatchResponse<ProductDto.Response> handle(Command command) {
            return batchProcessor.processSequential(
                    command.request(),
                    ProductDto.Request::sku,
                    item -> createProductHandler.handle(new CreateProductCommandRecord.Command(item))
            );
        }
    }
}

