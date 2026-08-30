package com.zenlytic.auth;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(scanBasePackages = "com.zenlytic")
public class AuthTenantApplication {

    public static void main(String[] args) {
        SpringApplication.run(AuthTenantApplication.class, args);
    }
}
