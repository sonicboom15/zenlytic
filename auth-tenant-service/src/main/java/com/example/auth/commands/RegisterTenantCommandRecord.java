package com.example.auth.commands;

import com.example.auth.dto.TenantRegistrationDto;
import com.example.auth.dto.TenantResponseDto;
import com.example.auth.entity.Tenant;
import com.example.auth.entity.User;
import com.example.auth.repository.TenantRepository;
import com.example.auth.repository.UserRepository;
import com.example.common.cqrs.command.Command;
import com.example.common.cqrs.command.CommandHandler;
import com.example.common.exception.ConflictException;
import com.example.common.security.JwtTokenProvider;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;
import java.util.UUID;

public class RegisterTenantCommandRecord {

    private static final Logger log = LoggerFactory.getLogger(RegisterTenantCommandRecord.class);

    public record Command(TenantRegistrationDto registrationDto) implements com.example.common.cqrs.command.Command<TenantResponseDto> {}

    @Component
    public static class Handler implements CommandHandler<Command, TenantResponseDto> {

        private final TenantRepository tenantRepository;
        private final UserRepository userRepository;
        private final PasswordEncoder passwordEncoder;
        private final JwtTokenProvider tokenProvider;

        public Handler(TenantRepository tenantRepository, UserRepository userRepository,
                       PasswordEncoder passwordEncoder, JwtTokenProvider tokenProvider) {
            this.tenantRepository = tenantRepository;
            this.userRepository = userRepository;
            this.passwordEncoder = passwordEncoder;
            this.tokenProvider = tokenProvider;
        }

        @Override
        @Transactional
        public TenantResponseDto handle(Command command) {
            TenantRegistrationDto dto = command.registrationDto();

            if (tenantRepository.existsByTenantId(dto.tenantId())) {
                throw new ConflictException("Tenant with ID '" + dto.tenantId() + "' already exists");
            }

            // 1. Create Tenant
            Tenant tenant = Tenant.builder()
                    .tenantId(dto.tenantId())
                    .name(dto.name())
                    .tier(dto.tier() != null ? dto.tier() : "STARTER")
                    .status("ACTIVE")
                    .build();
            tenantRepository.save(tenant);

            // 2. Create Root Admin User
            String userId = "usr-" + UUID.randomUUID().toString().substring(0, 8);
            Set<String> roles = Set.of("ADMIN", "TENANT_ADMIN");
            Set<String> permissions = Set.of("user:read", "user:write", "product:read", "product:write", "order:read", "order:write");

            User adminUser = User.builder()
                    .userId(userId)
                    .email(dto.adminEmail())
                    .password(passwordEncoder.encode(dto.adminPassword()))
                    .fullName(dto.name() + " Administrator")
                    .status("ACTIVE")
                    .roles(roles)
                    .permissions(permissions)
                    .build();
            adminUser.setTenantId(dto.tenantId());
            userRepository.save(adminUser);

            String token = tokenProvider.generateToken(userId, dto.adminEmail(), dto.tenantId(), roles, permissions);

            log.info("Successfully registered tenant [{}] and created root admin [{}]", dto.tenantId(), dto.adminEmail());

            return TenantResponseDto.builder()
                    .tenantId(tenant.getTenantId())
                    .name(tenant.getName())
                    .tier(tenant.getTier())
                    .status(tenant.getStatus())
                    .token(token)
                    .createdAt(tenant.getCreatedAt())
                    .build();
        }
    }
}
