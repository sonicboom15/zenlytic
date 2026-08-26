package com.example.product.commands;

import com.example.common.cqrs.command.Command;
import com.example.common.cqrs.command.CommandHandler;
import com.example.common.exception.ResourceNotFoundException;
import com.example.product.entity.Product;
import com.example.product.repository.ProductRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

public class ReleaseStockCommandRecord {

    private static final Logger log = LoggerFactory.getLogger(ReleaseStockCommandRecord.class);

    public record Command(String sku, int quantity, String orderId) implements com.example.common.cqrs.command.Command<Void> {}

    @Component
    public static class Handler implements CommandHandler<Command, Void> {

        private final ProductRepository productRepository;

        public Handler(ProductRepository productRepository) {
            this.productRepository = productRepository;
        }

        @Override
        @Transactional
        public Void handle(Command command) {
            Product product = productRepository.findBySku(command.sku())
                    .orElseThrow(() -> new ResourceNotFoundException("Product", "SKU", command.sku()));

            int newReserved = Math.max(0, product.getReservedStock() - command.quantity());
            product.setReservedStock(newReserved);
            productRepository.save(product);

            log.info("Compensated/Released {} units of SKU '{}' for Order '{}'", command.quantity(), command.sku(), command.orderId());
            return null;
        }
    }
}
