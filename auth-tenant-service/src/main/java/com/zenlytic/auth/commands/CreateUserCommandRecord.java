package com.zenlytic.auth.commands;

import com.zenlytic.auth.dto.UserDto;
import com.zenlytic.auth.entity.User;
import com.zenlytic.auth.repository.UserRepository;
import com.zenlytic.common.cqrs.command.Command;
import com.zenlytic.common.cqrs.command.CommandHandler;
import com.zenlytic.common.exception.ConflictException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

public final class CreateUserCommandRecord {

    public record Command(UserDto.CreateRequest request) implements com.zenlytic.common.cqrs.command.Command<UserDto.Response> {}

    @Component
    public static class Handler implements CommandHandler<Command, UserDto.Response> {

        private final UserRepository userRepository;
        private final PasswordEncoder passwordEncoder;

        public Handler(UserRepository userRepository, PasswordEncoder passwordEncoder) {
            this.userRepository = userRepository;
            this.passwordEncoder = passwordEncoder;
        }

        @Override
        @Transactional
        public UserDto.Response handle(Command command) {
            UserDto.CreateRequest req = command.request();

            if (userRepository.findByEmail(req.email()).isPresent()) {
                throw new ConflictException("User with email '" + req.email() + "' already exists");
            }

            String userId = "usr-" + UUID.randomUUID().toString().substring(0, 8);
            Set<String> roles = req.roles() != null && !req.roles().isEmpty() ? req.roles() : Set.of("ROLE_SALES_REP");
            Set<String> permissions = req.permissions() != null ? req.permissions() : new HashSet<>();

            User user = User.builder()
                    .userId(userId)
                    .email(req.email())
                    .password(passwordEncoder.encode(req.password()))
                    .fullName(req.fullName())
                    .phoneNumber(req.phoneNumber())
                    .status(req.status() != null ? req.status() : "ACTIVE")
                    .roles(roles)
                    .permissions(permissions)
                    .build();

            User saved = userRepository.save(user);
            return mapToResponse(saved);
        }

        public static UserDto.Response mapToResponse(User u) {
            return new UserDto.Response(
                    u.getUserId(),
                    u.getTenantId(),
                    u.getEmail(),
                    u.getFullName(),
                    u.getPhoneNumber(),
                    u.getStatus(),
                    u.getRoles(),
                    u.getPermissions(),
                    u.getCreatedAt(),
                    u.getUpdatedAt()
            );
        }
    }
}

