package com.zenlytic.worker.repository;

import com.zenlytic.worker.entity.WebhookDeliveryLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WebhookDeliveryLogRepository extends JpaRepository<WebhookDeliveryLog, Long> {
    List<WebhookDeliveryLog> findByTenantIdOrderByCreatedAtDesc(String tenantId);
}
