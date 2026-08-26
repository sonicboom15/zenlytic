package com.example.product.commands;

import com.example.common.context.TenantContextHolder;
import com.example.common.cqrs.command.Command;
import com.example.common.cqrs.command.CommandHandler;
import com.example.common.exception.ConflictException;
import com.example.product.dto.ProductDto;
import com.example.product.entity.OutboxEvent;
import com.example.product.entity.Product;
import com.example.product.repository.OutboxRepository;
import com.example.product.repository.ProductRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

public class CreateProductCommandRecord {

    private static final Logger log = LoggerFactory.getLogger(CreateProductCommandRecord.class);

    public record Command(ProductDto.Request request) implements com.example.common.cqrs.command.Command<ProductDto.Response> {}

    @Component
    public static class Handler implements CommandHandler<Command, ProductDto.Response> {

        private final ProductRepository productRepository;
        private final OutboxRepository outboxRepository;
        private final ObjectMapper objectMapper;

        public Handler(ProductRepository productRepository, OutboxRepository outboxRepository, ObjectMapper objectMapper) {
            this.productRepository = productRepository;
            this.outboxRepository = outboxRepository;
            this.objectMapper = objectMapper;
        }

        @Override
        @Transactional
        public ProductDto.Response handle(Command command) {
            ProductDto.Request request = command.request();
            String tenantId = TenantContextHolder.getTenantId();

            if (productRepository.existsBySku(request.sku())) {
                throw new ConflictException(String.format("Product with SKU '%s' already exists for tenant '%s'", request.sku(), tenantId));
            }

            Product product = Product.builder()
                    .sku(request.sku())
                    .name(request.name())
                    .description(request.description())
                    .price(request.price())
                    .stockQuantity(request.stockQuantity())
                    .reservedStock(0)
                    .category(request.category())
                    .status("ACTIVE")
                    .build();
            product.setTenantId(tenantId);

            Product savedProduct = productRepository.save(product);

            // Write to Transactional Outbox (Dual-Write Prevention)
            try {
                String payloadJson = objectMapper.writeValueAsString(savedProduct);
                OutboxEvent outboxEvent = OutboxEvent.builder()
                        .eventType("PRODUCT_CREATED")
                        .aggregateType("PRODUCT")
                        .aggregateId(savedProduct.getSku())
                        .payload(payloadJson)
                        .status("PENDING")
                        .build();
                outboxEvent.setTenantId(tenantId);

                outboxRepository.save(outboxEvent);
                log.info("Created Product [{}] and staged OutboxEvent [{}] atomically", savedProduct.getSku(), outboxEvent.getEventId());
            } catch (Exception ex) {
                log.error("Failed to serialize outbox event payload: {}", ex.getMessage());
            }

            return mapToResponse(savedProduct);
        }

        private ProductDto.Response mapToResponse(Product p) {
            return ProductDto.Response.builder()
                    .id(p.getId())
                    .sku(p.getSku())
                    .name(p.getName())
                    .description(p.getDescription())
                    .price(p.getPrice())
                    .stockQuantity(p.getStockQuantity())
                    .availableStock(p.getAvailableStock())
                    .category(p.getCategory())
                    .tenantId(p.getTenantId())
                    .status(p.getStatus())
                    .createdAt(p.getCreatedAt())
                    .build();
        }
    }
}
