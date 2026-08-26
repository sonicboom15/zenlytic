package com.example.product.queries;

import com.example.common.cqrs.query.Query;
import com.example.common.cqrs.query.QueryHandler;
import com.example.common.exception.ResourceNotFoundException;
import com.example.product.dto.ProductDto;
import com.example.product.entity.Product;
import com.example.product.repository.ProductRepository;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Component;

public class GetProductByIdQueryRecord {

    public record Query(Long id) implements com.example.common.cqrs.query.Query<ProductDto.Response> {}

    @Component
    public static class Handler implements QueryHandler<Query, ProductDto.Response> {

        private final ProductRepository productRepository;

        public Handler(ProductRepository productRepository) {
            this.productRepository = productRepository;
        }

        @Override
        @Cacheable(value = "products", keyGenerator = "tenantKeyGenerator")
        public ProductDto.Response handle(Query query) {
            Product product = productRepository.findById(query.id())
                    .orElseThrow(() -> new ResourceNotFoundException("Product", "ID", query.id()));

            return ProductDto.Response.builder()
                    .id(product.getId())
                    .sku(product.getSku())
                    .name(product.getName())
                    .description(product.getDescription())
                    .price(product.getPrice())
                    .stockQuantity(product.getStockQuantity())
                    .availableStock(product.getAvailableStock())
                    .category(product.getCategory())
                    .tenantId(product.getTenantId())
                    .status(product.getStatus())
                    .createdAt(product.getCreatedAt())
                    .build();
        }
    }
}
