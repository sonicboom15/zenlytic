package com.example.auth;

import com.example.auth.controller.TenantController;
import com.example.auth.dto.TenantRegistrationDto;
import com.example.auth.dto.TenantResponseDto;
import com.example.auth.queries.GetTenantByIdQueryRecord;
import com.example.common.cqrs.command.CommandBus;
import com.example.common.cqrs.query.QueryBus;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class TenantControllerTest {

    private MockMvc mockMvc;
    private CommandBus commandBus;
    private QueryBus queryBus;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        commandBus = mock(CommandBus.class);
        queryBus = mock(QueryBus.class);
        objectMapper = new ObjectMapper();
        TenantController tenantController = new TenantController(commandBus, queryBus);
        mockMvc = MockMvcBuilders.standaloneSetup(tenantController).build();
    }

    @Test
    @DisplayName("POST /api/v1/tenants/register should onboard tenant successfully")
    void testRegisterTenant() throws Exception {
        TenantRegistrationDto request = TenantRegistrationDto.builder()
                .tenantId("globex")
                .name("Globex Corporation")
                .adminEmail("ceo@globex.com")
                .adminPassword("Secret12345!")
                .tier("ENTERPRISE")
                .build();

        TenantResponseDto response = TenantResponseDto.builder()
                .tenantId("globex")
                .name("Globex Corporation")
                .tier("ENTERPRISE")
                .status("ACTIVE")
                .token("mock-token-xyz")
                .build();

        when(commandBus.dispatch(any())).thenReturn(response);

        mockMvc.perform(post("/api/v1/tenants/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.tenantId").value("globex"))
                .andExpect(jsonPath("$.data.tier").value("ENTERPRISE"));
    }

    @Test
    @DisplayName("GET /api/v1/tenants/{id} should return tenant details")
    void testGetTenant() throws Exception {
        TenantResponseDto response = TenantResponseDto.builder()
                .tenantId("acme")
                .name("Acme Corp")
                .tier("STARTER")
                .status("ACTIVE")
                .build();

        when(queryBus.execute(any(GetTenantByIdQueryRecord.Query.class))).thenReturn(response);

        mockMvc.perform(get("/api/v1/tenants/acme"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.tenantId").value("acme"));
    }
}
