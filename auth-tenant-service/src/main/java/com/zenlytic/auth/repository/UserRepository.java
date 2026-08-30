package com.zenlytic.auth.repository;

import com.zenlytic.auth.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByEmailAndTenantId(String email, String tenantId);
    Optional<User> findByUserId(String userId);
    boolean existsByEmailAndTenantId(String email, String tenantId);
}
