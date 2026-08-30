package com.zenlytic.configservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(scanBasePackages = {"com.zenlytic.configservice", "com.zenlytic.common"})
public class ConfigFeatureApplication {

    public static void main(String[] args) {
        SpringApplication.run(ConfigFeatureApplication.class, args);
    }
}
