package com.zenlytic.product.commands;

import com.zenlytic.common.cqrs.command.Command;
import com.zenlytic.common.cqrs.command.CommandHandler;
import com.zenlytic.common.exception.ResourceNotFoundException;
import com.zenlytic.product.entity.Product;
import com.zenlytic.product.repository.ProductRepository;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

public final class DeleteProductCommandRecord {

    public record Command(Long id) implements com.zenlytic.common.cqrs.command.Command<Void> {}

    @Component
    public static class Handler implements CommandHandler<Command, Void> {

        private final ProductRepository productRepository;

        public Handler(ProductRepository productRepository) {
            this.productRepository = productRepository;
        }

        @Override
        @Transactional
        public Void handle(Command command) {
            Product product = productRepository.findById(command.id())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + command.id()));

            product.setStatus("ARCHIVED");
            productRepository.save(product);
            return null;
        }
    }
}

