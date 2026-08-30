package com.zenlytic.configservice.repository;

import com.zenlytic.configservice.entity.ConfigEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConfigEntryRepository extends JpaRepository<ConfigEntry, Long> {
    Optional<ConfigEntry> findByConfigKey(String configKey);
    Optional<ConfigEntry> findByConfigKeyAndTenantIdAndServiceName(String configKey, String tenantId, String serviceName);
    List<ConfigEntry> findByTenantId(String tenantId);
    List<ConfigEntry> findByTenantIdIsNull();
}
