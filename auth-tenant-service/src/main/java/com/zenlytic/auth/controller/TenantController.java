package com.zenlytic.auth.controller;

import com.zenlytic.auth.commands.RegisterTenantCommandRecord;
import com.zenlytic.auth.dto.TenantRegistrationDto;
import com.zenlytic.auth.dto.TenantResponseDto;
import com.zenlytic.auth.queries.GetTenantByIdQueryRecord;
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

@RestController
@RequestMapping("/api/v1/tenants")
@Tag(name = "Tenants", description = "Multi-Tenant onboarding and tenant management APIs")
public class TenantController {

    private final CommandBus commandBus;
    private final QueryBus queryBus;

    public TenantController(CommandBus commandBus, QueryBus queryBus) {
        this.commandBus = commandBus;
        this.queryBus = queryBus;
    }

    @PostMapping("/register")
    @Auditable(action = "REGISTER_TENANT", resource = "TENANT")
    @Operation(summary = "Onboard a new organization tenant and initialize root administrator")
    public ResponseEntity<ApiResponse<TenantResponseDto>> register(@Valid @RequestBody TenantRegistrationDto request) {
        TenantResponseDto response = commandBus.dispatch(new RegisterTenantCommandRecord.Command(request));
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created("Tenant onboarded successfully", response));
    }

    @GetMapping
    @Operation(summary = "List all organization tenants")
    public ResponseEntity<ApiResponse<java.util.List<TenantResponseDto>>> listTenants() {
        java.util.List<TenantResponseDto> response = queryBus.execute(new com.zenlytic.auth.queries.ListTenantsQueryRecord.Query());
        return ResponseEntity.ok(ApiResponse.ok("Tenants list retrieved", response));
    }

    @GetMapping("/{tenantId}")
    @Operation(summary = "Get tenant details by tenant ID")
    public ResponseEntity<ApiResponse<TenantResponseDto>> getTenant(@PathVariable String tenantId) {
        TenantResponseDto response = queryBus.execute(new GetTenantByIdQueryRecord.Query(tenantId));
        return ResponseEntity.ok(ApiResponse.ok("Tenant retrieved", response));
    }
}
