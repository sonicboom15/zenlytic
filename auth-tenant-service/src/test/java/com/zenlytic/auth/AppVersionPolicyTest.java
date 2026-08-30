package com.zenlytic.auth;

import com.zenlytic.auth.dto.AppVersionCheckDto;
import com.zenlytic.auth.entity.AppVersionPolicy;
import com.zenlytic.auth.queries.CheckAppVersionQueryRecord;
import com.zenlytic.auth.repository.AppVersionPolicyRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class AppVersionPolicyTest {

    @Test
    @DisplayName("Should detect FORCE_UPDATE_REQUIRED when client version is below minimum supported")
    void testForceUpdateRequired() {
        AppVersionPolicyRepository repository = mock(AppVersionPolicyRepository.class);
        AppVersionPolicy policy = AppVersionPolicy.builder()
                .clientType("iOS")
                .minSupportedVersion("2.0.0")
                .latestVersion("3.0.0")
                .updateUrl("https://apps.apple.com/app/id123")
                .upgradeTitle("Upgrade Required")
                .upgradeMessage("Please update")
                .build();

        when(repository.findByClientTypeIgnoreCase("iOS")).thenReturn(Optional.of(policy));

        CheckAppVersionQueryRecord.Handler handler = new CheckAppVersionQueryRecord.Handler(repository);

        // Old version below min
        AppVersionCheckDto result = handler.handle(new CheckAppVersionQueryRecord.Query("iOS", "1.5.0"));
        assertEquals("FORCE_UPDATE_REQUIRED", result.status());

        // Deprecated version between min and latest
        AppVersionCheckDto result2 = handler.handle(new CheckAppVersionQueryRecord.Query("iOS", "2.5.0"));
        assertEquals("DEPRECATED_WARN", result2.status());

        // Latest version
        AppVersionCheckDto result3 = handler.handle(new CheckAppVersionQueryRecord.Query("iOS", "3.0.0"));
        assertEquals("SUPPORTED", result3.status());
    }
}
