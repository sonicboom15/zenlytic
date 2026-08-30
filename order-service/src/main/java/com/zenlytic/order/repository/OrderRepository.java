package com.zenlytic.order.repository;

import com.zenlytic.order.entity.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    Optional<Order> findByOrderId(String orderId);

    @Query("SELECT o FROM Order o WHERE " +
            "(:status IS NULL OR o.status = :status) AND " +
            "(:customerId IS NULL OR o.customerId = :customerId) AND " +
            "(:search IS NULL OR LOWER(o.orderId) LIKE :search OR LOWER(o.customerName) LIKE :search)")
    Page<Order> searchOrders(
            @Param("status") String status,
            @Param("customerId") String customerId,
            @Param("search") String search,
            Pageable pageable
    );
}
