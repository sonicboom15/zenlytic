package com.example.worker.repository;

import com.example.worker.entity.WebhookDeliveryLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WebhookDeliveryLogRepository extends JpaRepository<WebhookDeliveryLog, Long> {
    List<WebhookDeliveryLog> findByTenantIdOrderByCreatedAtDesc(String tenantId);
}
