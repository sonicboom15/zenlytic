package com.example.auth.controller;

import com.example.auth.commands.LoginCommandRecord;
import com.example.auth.dto.LoginDto;
import com.example.common.cqrs.command.CommandBus;
import com.example.common.model.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
@Tag(name = "Authentication", description = "User login and JWT token issuance APIs")
public class AuthController {

    private final CommandBus commandBus;

    public AuthController(CommandBus commandBus) {
        this.commandBus = commandBus;
    }

    @PostMapping("/login")
    @Operation(summary = "Authenticate user and issue multi-tenant JWT bearer token")
    public ResponseEntity<ApiResponse<LoginDto.Response>> login(@Valid @RequestBody LoginDto.Request request) {
        LoginDto.Response response = commandBus.dispatch(new LoginCommandRecord.Command(request));
        return ResponseEntity.ok(ApiResponse.ok("Authentication successful", response));
    }
}
