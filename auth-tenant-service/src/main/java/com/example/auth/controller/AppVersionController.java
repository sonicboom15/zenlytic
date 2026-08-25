package com.example.auth.controller;

import com.example.auth.dto.AppVersionCheckDto;
import com.example.auth.queries.CheckAppVersionQueryRecord;
import com.example.common.cqrs.query.QueryBus;
import com.example.common.model.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/app")
@Tag(name = "Mobile App Versioning", description = "Mobile client version verification and force-update policies")
public class AppVersionController {

    private final QueryBus queryBus;

    public AppVersionController(QueryBus queryBus) {
        this.queryBus = queryBus;
    }

    @GetMapping("/version-check")
    @Operation(summary = "Check mobile client app version against deprecation and minimum supported version policy")
    public ResponseEntity<ApiResponse<AppVersionCheckDto>> checkVersion(
            @RequestParam(defaultValue = "iOS") String client,
            @RequestParam(defaultValue = "1.0.0") String version) {

        AppVersionCheckDto response = queryBus.execute(new CheckAppVersionQueryRecord.Query(client, version));
        return ResponseEntity.ok(ApiResponse.ok("Version policy check completed", response));
    }
}
