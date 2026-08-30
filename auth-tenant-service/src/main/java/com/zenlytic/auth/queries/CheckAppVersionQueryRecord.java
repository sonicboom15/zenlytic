package com.zenlytic.auth.queries;

import com.zenlytic.auth.dto.AppVersionCheckDto;
import com.zenlytic.auth.entity.AppVersionPolicy;
import com.zenlytic.auth.repository.AppVersionPolicyRepository;
import com.zenlytic.common.cqrs.query.Query;
import com.zenlytic.common.cqrs.query.QueryHandler;
import org.springframework.stereotype.Component;

import java.util.Optional;

public class CheckAppVersionQueryRecord {

    public record Query(String clientType, String clientVersion) implements com.zenlytic.common.cqrs.query.Query<AppVersionCheckDto> {}

    @Component
    public static class Handler implements QueryHandler<Query, AppVersionCheckDto> {

        private final AppVersionPolicyRepository policyRepository;

        public Handler(AppVersionPolicyRepository policyRepository) {
            this.policyRepository = policyRepository;
        }

        @Override
        public AppVersionCheckDto handle(Query query) {
            Optional<AppVersionPolicy> policyOpt = policyRepository.findByClientTypeIgnoreCase(query.clientType());

            if (policyOpt.isEmpty()) {
                return AppVersionCheckDto.builder()
                        .status("SUPPORTED")
                        .clientType(query.clientType())
                        .clientVersion(query.clientVersion())
                        .build();
            }

            AppVersionPolicy policy = policyOpt.get();
            int minCompare = compareVersions(query.clientVersion(), policy.getMinSupportedVersion());
            int latestCompare = compareVersions(query.clientVersion(), policy.getLatestVersion());

            String status;
            if (minCompare < 0) {
                status = "FORCE_UPDATE_REQUIRED";
            } else if (latestCompare < 0) {
                status = "DEPRECATED_WARN";
            } else {
                status = "SUPPORTED";
            }

            return AppVersionCheckDto.builder()
                    .status(status)
                    .clientType(policy.getClientType())
                    .clientVersion(query.clientVersion())
                    .minSupportedVersion(policy.getMinSupportedVersion())
                    .latestVersion(policy.getLatestVersion())
                    .updateUrl(policy.getUpdateUrl())
                    .upgradeTitle(policy.getUpgradeTitle())
                    .upgradeMessage(policy.getUpgradeMessage())
                    .build();
        }

        private int compareVersions(String v1, String v2) {
            String[] parts1 = v1.split("\\.");
            String[] parts2 = v2.split("\\.");
            int length = Math.max(parts1.length, parts2.length);

            for (int i = 0; i < length; i++) {
                int p1 = i < parts1.length ? Integer.parseInt(parts1[i].replaceAll("\\D+", "")) : 0;
                int p2 = i < parts2.length ? Integer.parseInt(parts2[i].replaceAll("\\D+", "")) : 0;
                if (p1 != p2) {
                    return Integer.compare(p1, p2);
                }
            }
            return 0;
        }
    }
}
