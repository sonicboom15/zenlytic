package com.example.worker.repository;

import com.example.worker.entity.ScheduledJobDefinition;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ScheduledJobRepository extends JpaRepository<ScheduledJobDefinition, Long> {
    Optional<ScheduledJobDefinition> findByJobKey(String jobKey);
}
