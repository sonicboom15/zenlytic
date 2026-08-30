package com.zenlytic.customer.repository;

import com.zenlytic.customer.entity.Customer;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {

    Optional<Customer> findByCustomerId(String customerId);

    Optional<Customer> findByCode(String code);

    boolean existsByCode(String code);

    @Query("SELECT c FROM Customer c WHERE " +
            "(:search IS NULL OR LOWER(c.name) LIKE :search OR LOWER(c.code) LIKE :search OR LOWER(c.companyName) LIKE :search) AND " +
            "(:status IS NULL OR c.status = :status) AND " +
            "(:tier IS NULL OR c.tier = :tier)")
    Page<Customer> searchCustomers(
            @Param("search") String search,
            @Param("status") String status,
            @Param("tier") String tier,
            Pageable pageable
    );
}
