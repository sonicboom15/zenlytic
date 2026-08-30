package com.zenlytic.product.queries;

import com.zenlytic.common.cqrs.query.Query;
import com.zenlytic.common.cqrs.query.QueryHandler;
import com.zenlytic.common.model.PagedResponse;
import com.zenlytic.product.dto.ProductDto;
import com.zenlytic.product.entity.Product;
import com.zenlytic.product.repository.ProductRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Component;

public class ListProductsQueryRecord {

    public record Query(int page, int size) implements com.zenlytic.common.cqrs.query.Query<PagedResponse<ProductDto.Response>> {}

    @Component
    public static class Handler implements QueryHandler<Query, PagedResponse<ProductDto.Response>> {

        private final ProductRepository productRepository;

        public Handler(ProductRepository productRepository) {
            this.productRepository = productRepository;
        }

        @Override
        public PagedResponse<ProductDto.Response> handle(Query query) {
            Page<Product> productPage = productRepository.findAll(PageRequest.of(query.page(), query.size()));

            Page<ProductDto.Response> dtoPage = productPage.map(p -> ProductDto.Response.builder()
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
                    .build());

            return PagedResponse.from(dtoPage);
        }
    }
}
