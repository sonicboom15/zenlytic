package com.zenlytic.common.config;

import com.zenlytic.common.context.CurrentTenantArgumentResolver;
import com.zenlytic.common.context.CurrentUserArgumentResolver;
import com.zenlytic.common.versioning.ApiDeprecationInterceptor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.List;

@Configuration
public class WebMvcContextConfig implements WebMvcConfigurer {

    private final ApiDeprecationInterceptor apiDeprecationInterceptor;

    public WebMvcContextConfig(ApiDeprecationInterceptor apiDeprecationInterceptor) {
        this.apiDeprecationInterceptor = apiDeprecationInterceptor;
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(apiDeprecationInterceptor);
    }

    @Override
    public void addArgumentResolvers(List<HandlerMethodArgumentResolver> resolvers) {
        resolvers.add(new CurrentTenantArgumentResolver());
        resolvers.add(new CurrentUserArgumentResolver());
    }
}
