package com.zenlytic.product.commands;

import com.zenlytic.common.cqrs.command.Command;
import com.zenlytic.common.cqrs.command.CommandHandler;
import com.zenlytic.common.exception.ResourceNotFoundException;
import com.zenlytic.product.dto.ProductDto;
import com.zenlytic.product.entity.Product;
import com.zenlytic.product.repository.ProductRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

public class ReserveStockCommandRecord {

    private static final Logger log = LoggerFactory.getLogger(ReserveStockCommandRecord.class);

    public record Command(ProductDto.ReserveStockRequest request) implements com.zenlytic.common.cqrs.command.Command<ProductDto.ReserveStockResponse> {}

    @Component
    public static class Handler implements CommandHandler<Command, ProductDto.ReserveStockResponse> {

        private final ProductRepository productRepository;

        public Handler(ProductRepository productRepository) {
            this.productRepository = productRepository;
        }

        @Override
        @Transactional
        public ProductDto.ReserveStockResponse handle(Command command) {
            ProductDto.ReserveStockRequest req = command.request();

            Product product = productRepository.findBySku(req.sku())
                    .orElseThrow(() -> new ResourceNotFoundException("Product", "SKU", req.sku()));

            if (product.getAvailableStock() < req.quantity()) {
                log.warn("Insufficient stock for SKU '{}': Requested={}, Available={}",
                        req.sku(), req.quantity(), product.getAvailableStock());
                return ProductDto.ReserveStockResponse.builder()
                        .reserved(false)
                        .sku(req.sku())
                        .quantityReserved(0)
                        .message("Insufficient stock")
                        .build();
            }

            product.setReservedStock(product.getReservedStock() + req.quantity());
            productRepository.save(product);

            log.info("Reserved {} units of SKU '{}' for Order '{}'", req.quantity(), req.sku(), req.orderId());

            return ProductDto.ReserveStockResponse.builder()
                    .reserved(true)
                    .sku(req.sku())
                    .quantityReserved(req.quantity())
                    .message("Stock reserved successfully")
                    .build();
        }
    }
}
