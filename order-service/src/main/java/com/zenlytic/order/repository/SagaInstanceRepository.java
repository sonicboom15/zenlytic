package com.zenlytic.order.repository;

import com.zenlytic.order.entity.SagaInstanceEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SagaInstanceRepository extends JpaRepository<SagaInstanceEntity, Long> {
    Optional<SagaInstanceEntity> findBySagaId(String sagaId);
}
