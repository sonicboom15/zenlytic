package com.zenlytic.worker.repository;

import com.zenlytic.worker.entity.ScheduledJobDefinition;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ScheduledJobRepository extends JpaRepository<ScheduledJobDefinition, Long> {
    Optional<ScheduledJobDefinition> findByJobKey(String jobKey);
}
