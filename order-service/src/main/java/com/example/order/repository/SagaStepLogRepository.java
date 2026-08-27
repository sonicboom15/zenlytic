package com.example.order.repository;

import com.example.order.entity.SagaStepLogEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SagaStepLogRepository extends JpaRepository<SagaStepLogEntity, Long> {
    List<SagaStepLogEntity> findBySagaInstance_SagaIdOrderByCreatedAtAsc(String sagaId);
}
