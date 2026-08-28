package com.example.configservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(scanBasePackages = {"com.example.configservice", "com.example.common"})
public class ConfigFeatureApplication {

    public static void main(String[] args) {
        SpringApplication.run(ConfigFeatureApplication.class, args);
    }
}
