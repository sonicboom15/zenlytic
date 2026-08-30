package com.zenlytic.auth;

import com.zenlytic.auth.commands.LoginCommandRecord;
import com.zenlytic.auth.controller.AuthController;
import com.zenlytic.auth.dto.LoginDto;
import com.zenlytic.common.cqrs.command.CommandBus;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.Set;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class AuthControllerTest {

    private MockMvc mockMvc;
    private CommandBus commandBus;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        commandBus = mock(CommandBus.class);
        objectMapper = new ObjectMapper();
        AuthController authController = new AuthController(commandBus);
        mockMvc = MockMvcBuilders.standaloneSetup(authController).build();
    }

    @Test
    @DisplayName("POST /api/v1/auth/login should authenticate user and return token")
    void testLoginSuccess() throws Exception {
        LoginDto.Request request = LoginDto.Request.builder()
                .email("admin@acme.com")
                .password("Password123!")
                .tenantId("acme")
                .build();

        LoginDto.Response response = LoginDto.Response.builder()
                .token("mock-jwt-token-123")
                .userId("usr-101")
                .email("admin@acme.com")
                .tenantId("acme")
                .roles(Set.of("ADMIN"))
                .permissions(Set.of("product:read", "product:write"))
                .build();

        when(commandBus.dispatch(any())).thenReturn(response);

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.token").value("mock-jwt-token-123"))
                .andExpect(jsonPath("$.data.email").value("admin@acme.com"))
                .andExpect(jsonPath("$.data.tenantId").value("acme"));
    }
}
