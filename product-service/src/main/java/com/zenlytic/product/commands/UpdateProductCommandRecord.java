package com.zenlytic.product.commands;

import com.zenlytic.common.cqrs.command.Command;
import com.zenlytic.common.cqrs.command.CommandHandler;
import com.zenlytic.common.exception.ResourceNotFoundException;
import com.zenlytic.product.dto.ProductDto;
import com.zenlytic.product.entity.Product;
import com.zenlytic.product.repository.ProductRepository;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

public final class UpdateProductCommandRecord {

    public record Command(Long id, ProductDto.Request request) implements com.zenlytic.common.cqrs.command.Command<ProductDto.Response> {}

    @Component
    public static class Handler implements CommandHandler<Command, ProductDto.Response> {

        private final ProductRepository productRepository;

        public Handler(ProductRepository productRepository) {
            this.productRepository = productRepository;
        }

        @Override
        @Transactional
        public ProductDto.Response handle(Command command) {
            Product product = productRepository.findById(command.id())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + command.id()));

            ProductDto.Request req = command.request();
            if (req.name() != null) product.setName(req.name());
            if (req.description() != null) product.setDescription(req.description());
            if (req.price() != null) product.setPrice(req.price());
            if (req.stockQuantity() != null) product.setStockQuantity(req.stockQuantity());
            if (req.category() != null) product.setCategory(req.category());

            Product saved = productRepository.save(product);

            return ProductDto.Response.builder()
                    .id(saved.getId())
                    .sku(saved.getSku())
                    .name(saved.getName())
                    .description(saved.getDescription())
                    .price(saved.getPrice())
                    .stockQuantity(saved.getStockQuantity())
                    .availableStock(saved.getAvailableStock())
                    .category(saved.getCategory())
                    .tenantId(saved.getTenantId())
                    .status(saved.getStatus())
                    .createdAt(saved.getCreatedAt())
                    .build();
        }
    }
}

