package com.example.common.logging.masking;

import ch.qos.logback.classic.PatternLayout;
import ch.qos.logback.classic.spi.ILoggingEvent;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class DataMaskingPatternLayout extends PatternLayout {

    private static final Pattern BEARER_PATTERN = Pattern.compile(
            "Bearer\\s+([a-zA-Z0-9._\\-]+)",
            Pattern.CASE_INSENSITIVE
    );

    private static final Pattern MASK_PATTERNS = Pattern.compile(
            "(\"?)(password|token|secret|accessToken|refreshToken)(\"?\\s*[:=]\\s*[\"']?)([^\"',\\s}]+)([\"']?)",
            Pattern.CASE_INSENSITIVE
    );

    @Override
    public String doLayout(ILoggingEvent event) {
        String message = super.doLayout(event);
        return maskMessage(message);
    }

    public static String maskMessage(String message) {
        if (message == null || message.isBlank()) {
            return message;
        }

        // 1. Mask Bearer tokens first
        Matcher bearerMatcher = BEARER_PATTERN.matcher(message);
        String step1 = bearerMatcher.replaceAll("Bearer ***");

        // 2. Mask JSON/properties sensitive keys
        Matcher matcher = MASK_PATTERNS.matcher(step1);
        StringBuilder sb = new StringBuilder();
        while (matcher.find()) {
            matcher.appendReplacement(sb, matcher.group(2) + "=\"***\"");
        }
        matcher.appendTail(sb);
        return sb.toString();
    }
}
