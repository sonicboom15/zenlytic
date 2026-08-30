package com.zenlytic.product.entity;

import com.zenlytic.common.entity.SoftDeletableEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

import java.math.BigDecimal;

@Entity
@Table(name = "products")
public class Product extends SoftDeletableEntity {

    @Column(name = "sku", nullable = false, length = 64)
    private String sku;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "description", length = 1024)
    private String description;

    @Column(name = "price", nullable = false, precision = 12, scale = 2)
    private BigDecimal price;

    @Column(name = "stock_quantity", nullable = false)
    private Integer stockQuantity = 0;

    @Column(name = "reserved_stock", nullable = false)
    private Integer reservedStock = 0;

    @Column(name = "category")
    private String category;

    @Column(name = "status", nullable = false)
    private String status = "ACTIVE";

    public Product() {}

    public Product(String sku, String name, String description, BigDecimal price, Integer stockQuantity, Integer reservedStock, String category, String status) {
        this.sku = sku;
        this.name = name;
        this.description = description;
        this.price = price;
        this.stockQuantity = stockQuantity != null ? stockQuantity : 0;
        this.reservedStock = reservedStock != null ? reservedStock : 0;
        this.category = category;
        this.status = status != null ? status : "ACTIVE";
    }

    public int getAvailableStock() {
        return Math.max(0, stockQuantity - reservedStock);
    }

    public String getSku() { return sku; }
    public void setSku(String sku) { this.sku = sku; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }

    public Integer getStockQuantity() { return stockQuantity; }
    public void setStockQuantity(Integer stockQuantity) { this.stockQuantity = stockQuantity; }

    public Integer getReservedStock() { return reservedStock; }
    public void setReservedStock(Integer reservedStock) { this.reservedStock = reservedStock; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String sku;
        private String name;
        private String description;
        private BigDecimal price;
        private Integer stockQuantity = 0;
        private Integer reservedStock = 0;
        private String category;
        private String status = "ACTIVE";

        public Builder sku(String sku) { this.sku = sku; return this; }
        public Builder name(String name) { this.name = name; return this; }
        public Builder description(String description) { this.description = description; return this; }
        public Builder price(BigDecimal price) { this.price = price; return this; }
        public Builder stockQuantity(Integer stockQuantity) { this.stockQuantity = stockQuantity; return this; }
        public Builder reservedStock(Integer reservedStock) { this.reservedStock = reservedStock; return this; }
        public Builder category(String category) { this.category = category; return this; }
        public Builder status(String status) { this.status = status; return this; }

        public Product build() {
            return new Product(sku, name, description, price, stockQuantity, reservedStock, category, status);
        }
    }
}
