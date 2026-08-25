package com.example.auth.commands;

import com.example.auth.dto.LoginDto;
import com.example.auth.entity.User;
import com.example.auth.repository.UserRepository;
import com.example.common.cqrs.command.Command;
import com.example.common.cqrs.command.CommandHandler;
import com.example.common.exception.UnauthorizedException;
import com.example.common.security.JwtTokenProvider;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

public class LoginCommandRecord {

    private static final Logger log = LoggerFactory.getLogger(LoginCommandRecord.class);

    public record Command(LoginDto.Request request) implements com.example.common.cqrs.command.Command<LoginDto.Response> {}

    @Component
    public static class Handler implements CommandHandler<Command, LoginDto.Response> {

        private final UserRepository userRepository;
        private final PasswordEncoder passwordEncoder;
        private final JwtTokenProvider tokenProvider;

        public Handler(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtTokenProvider tokenProvider) {
            this.userRepository = userRepository;
            this.passwordEncoder = passwordEncoder;
            this.tokenProvider = tokenProvider;
        }

        @Override
        public LoginDto.Response handle(Command command) {
            LoginDto.Request req = command.request();

            User user = userRepository.findByEmail(req.email())
                    .orElseThrow(() -> new UnauthorizedException("Invalid email or password"));

            if (!passwordEncoder.matches(req.password(), user.getPassword())) {
                throw new UnauthorizedException("Invalid email or password");
            }

            String token = tokenProvider.generateToken(
                    user.getUserId(),
                    user.getEmail(),
                    user.getTenantId(),
                    user.getRoles(),
                    user.getPermissions()
            );

            log.info("User [{}] authenticated successfully for tenant [{}]", user.getEmail(), user.getTenantId());

            return LoginDto.Response.builder()
                    .token(token)
                    .userId(user.getUserId())
                    .email(user.getEmail())
                    .tenantId(user.getTenantId())
                    .roles(user.getRoles())
                    .permissions(user.getPermissions())
                    .build();
        }
    }
}
