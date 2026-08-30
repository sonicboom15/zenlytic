package com.zenlytic.auth.controller;

import com.zenlytic.auth.commands.BatchCreateUsersCommandRecord;
import com.zenlytic.auth.commands.CreateUserCommandRecord;
import com.zenlytic.auth.dto.UserDto;
import com.zenlytic.auth.queries.ListUsersQueryRecord;
import com.zenlytic.common.batch.model.BatchRequest;
import com.zenlytic.common.batch.model.BatchResponse;
import com.zenlytic.common.cqrs.command.CommandBus;
import com.zenlytic.common.cqrs.query.QueryBus;
import com.zenlytic.common.logging.audit.Auditable;
import com.zenlytic.common.model.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/users")
@Tag(name = "Users", description = "Multi-Tenant User and RBAC Role Management APIs")
public class UserController {

    private final CommandBus commandBus;
    private final QueryBus queryBus;

    public UserController(CommandBus commandBus, QueryBus queryBus) {
        this.commandBus = commandBus;
        this.queryBus = queryBus;
    }

    @PostMapping
    @Auditable(action = "CREATE_USER", resource = "USER")
    @Operation(summary = "Create user with RBAC roles and permissions within active tenant")
    public ResponseEntity<ApiResponse<UserDto.Response>> createUser(@Valid @RequestBody UserDto.CreateRequest request) {
        UserDto.Response response = commandBus.dispatch(new CreateUserCommandRecord.Command(request));
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created("User created successfully", response));
    }

    @PostMapping("/batch")
    @Auditable(action = "BATCH_CREATE_USERS", resource = "USER")
    @Operation(summary = "Batch create/onboard users for active tenant")
    public ResponseEntity<ApiResponse<BatchResponse<UserDto.Response>>> batchCreateUsers(
            @Valid @RequestBody BatchRequest<UserDto.CreateRequest> request) {
        BatchResponse<UserDto.Response> response = commandBus.dispatch(new BatchCreateUsersCommandRecord.Command(request));
        return ResponseEntity.ok(ApiResponse.ok("Batch users import processed", response));
    }

    @GetMapping
    @Operation(summary = "List all users belonging to active tenant")
    public ResponseEntity<ApiResponse<List<UserDto.Response>>> listUsers() {
        List<UserDto.Response> response = queryBus.execute(new ListUsersQueryRecord.Query());
        return ResponseEntity.ok(ApiResponse.ok("Users list retrieved", response));
    }
}

