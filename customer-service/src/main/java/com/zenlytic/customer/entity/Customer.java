package com.zenlytic.customer.entity;

import com.zenlytic.common.crypto.EncryptedStringConverter;
import com.zenlytic.common.entity.TenantAwareEntity;
import jakarta.persistence.*;

import java.math.BigDecimal;

@Entity
@Table(name = "customers")
public class Customer extends TenantAwareEntity {

    @Column(name = "customer_id", nullable = false, unique = true, length = 64)
    private String customerId;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "code", nullable = false, length = 64)
    private String code;

    @Column(name = "company_name")
    private String companyName;

    @Column(name = "email")
    private String email;

    @Convert(converter = EncryptedStringConverter.class)
    @Column(name = "phone", length = 512)
    private String phone;

    @Convert(converter = EncryptedStringConverter.class)
    @Column(name = "tax_id", length = 512)
    private String taxId;

    @Column(name = "billing_address", columnDefinition = "TEXT")
    private String billingAddress;

    @Column(name = "shipping_address", columnDefinition = "TEXT")
    private String shippingAddress;

    @Column(name = "credit_limit", nullable = false, precision = 15, scale = 2)
    private BigDecimal creditLimit = new BigDecimal("10000.00");

    @Column(name = "current_balance", nullable = false, precision = 15, scale = 2)
    private BigDecimal currentBalance = BigDecimal.ZERO;

    @Column(name = "max_discount_percentage", nullable = false, precision = 5, scale = 2)
    private BigDecimal maxDiscountPercentage = new BigDecimal("15.00");

    @Column(name = "tier", nullable = false, length = 32)
    private String tier = "STANDARD"; // STANDARD, GOLD, PLATINUM

    @Column(name = "status", nullable = false, length = 32)
    private String status = "ACTIVE"; // ACTIVE, INACTIVE, SUSPENDED

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    public Customer() {}

    public Customer(String customerId, String name, String code, String companyName, String email, String phone, String taxId,
                    String billingAddress, String shippingAddress, BigDecimal creditLimit, BigDecimal currentBalance,
                    BigDecimal maxDiscountPercentage, String tier, String status, String notes) {
        this.customerId = customerId;
        this.name = name;
        this.code = code;
        this.companyName = companyName;
        this.email = email;
        this.phone = phone;
        this.taxId = taxId;
        this.billingAddress = billingAddress;
        this.shippingAddress = shippingAddress;
        this.creditLimit = creditLimit != null ? creditLimit : new BigDecimal("10000.00");
        this.currentBalance = currentBalance != null ? currentBalance : BigDecimal.ZERO;
        this.maxDiscountPercentage = maxDiscountPercentage != null ? maxDiscountPercentage : new BigDecimal("15.00");
        this.tier = tier != null ? tier : "STANDARD";
        this.status = status != null ? status : "ACTIVE";
        this.notes = notes;
    }

    public String getCustomerId() { return customerId; }
    public void setCustomerId(String customerId) { this.customerId = customerId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getTaxId() { return taxId; }
    public void setTaxId(String taxId) { this.taxId = taxId; }

    public String getBillingAddress() { return billingAddress; }
    public void setBillingAddress(String billingAddress) { this.billingAddress = billingAddress; }

    public String getShippingAddress() { return shippingAddress; }
    public void setShippingAddress(String shippingAddress) { this.shippingAddress = shippingAddress; }

    public BigDecimal getCreditLimit() { return creditLimit; }
    public void setCreditLimit(BigDecimal creditLimit) { this.creditLimit = creditLimit; }

    public BigDecimal getCurrentBalance() { return currentBalance; }
    public void setCurrentBalance(BigDecimal currentBalance) { this.currentBalance = currentBalance; }

    public BigDecimal getMaxDiscountPercentage() { return maxDiscountPercentage; }
    public void setMaxDiscountPercentage(BigDecimal maxDiscountPercentage) { this.maxDiscountPercentage = maxDiscountPercentage; }

    public String getTier() { return tier; }
    public void setTier(String tier) { this.tier = tier; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}

