package com.zenlytic.common.versioning;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class ApiDeprecationInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        if (handler instanceof HandlerMethod handlerMethod) {
            DeprecatedApi deprecatedApi = handlerMethod.getMethodAnnotation(DeprecatedApi.class);
            if (deprecatedApi == null) {
                deprecatedApi = handlerMethod.getBeanType().getAnnotation(DeprecatedApi.class);
            }

            if (deprecatedApi != null) {
                // Attach RFC 8594 Sunset header if provided
                if (!deprecatedApi.sunsetDate().isBlank()) {
                    response.setHeader("Sunset", deprecatedApi.sunsetDate());
                }

                // Attach Deprecation header
                if (deprecatedApi.deprecationTimestamp() > 0) {
                    response.setHeader("Deprecation", "@" + deprecatedApi.deprecationTimestamp());
                } else {
                    response.setHeader("Deprecation", "true");
                }

                // Attach Link to successor version if provided
                if (!deprecatedApi.successor().isBlank()) {
                    response.setHeader("Link", "<" + deprecatedApi.successor() + ">; rel=\"successor-version\"");
                }

                // Attach RFC 7234 Warning header
                response.setHeader("Warning", "299 - \"" + deprecatedApi.message() + "\"");
            }
        }
        return true;
    }
}
