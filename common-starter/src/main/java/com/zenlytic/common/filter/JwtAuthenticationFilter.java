package com.zenlytic.common.filter;

import com.zenlytic.common.context.TenantContext;
import com.zenlytic.common.context.TenantContextHolder;
import com.zenlytic.common.context.UserContext;
import com.zenlytic.common.context.UserContextHolder;
import com.zenlytic.common.security.CustomUserPrincipal;
import com.zenlytic.common.security.JwtTokenProvider;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider tokenProvider;

    public JwtAuthenticationFilter(JwtTokenProvider tokenProvider) {
        this.tokenProvider = tokenProvider;
    }

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain filterChain) throws ServletException, IOException {
        String jwt = getJwtFromRequest(request);

        if (StringUtils.hasText(jwt) && tokenProvider.validateToken(jwt)) {
            String userId = tokenProvider.getUserIdFromToken(jwt);
            String tenantId = tokenProvider.getTenantIdFromToken(jwt);
            String email = tokenProvider.getEmailFromToken(jwt);
            List<String> rolesList = tokenProvider.getRolesFromToken(jwt);
            List<String> permsList = tokenProvider.getPermissionsFromToken(jwt);

            Set<String> roles = rolesList != null ? new HashSet<>(rolesList) : Set.of();
            Set<String> permissions = permsList != null ? new HashSet<>(permsList) : Set.of();

            CustomUserPrincipal userPrincipal = new CustomUserPrincipal(userId, email, "", tenantId, roles, permissions);

            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(userPrincipal, null, userPrincipal.getAuthorities());
            authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

            SecurityContextHolder.getContext().setAuthentication(authentication);

            // Populate ThreadLocal contexts
            UserContextHolder.set(new UserContext(userId, email, tenantId, roles, permissions));
            if (TenantContextHolder.getTenantId() == null && StringUtils.hasText(tenantId)) {
                TenantContextHolder.set(new TenantContext(tenantId, "STARTER", "ACTIVE"));
            }
        }

        filterChain.doFilter(request, response);
    }

    private String getJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}
