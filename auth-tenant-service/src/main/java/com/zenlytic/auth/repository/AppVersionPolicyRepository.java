package com.zenlytic.auth.repository;

import com.zenlytic.auth.entity.AppVersionPolicy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AppVersionPolicyRepository extends JpaRepository<AppVersionPolicy, Long> {
    Optional<AppVersionPolicy> findByClientTypeIgnoreCase(String clientType);
}
