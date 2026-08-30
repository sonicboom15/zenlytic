package com.zenlytic.common.versioning;

public record ClientMetadata(
        String clientPlatform,
        String appVersion,
        String buildNumber,
        String deviceId
) {
    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String clientPlatform;
        private String appVersion;
        private String buildNumber;
        private String deviceId;

        public Builder clientPlatform(String clientPlatform) { this.clientPlatform = clientPlatform; return this; }
        public Builder appVersion(String appVersion) { this.appVersion = appVersion; return this; }
        public Builder buildNumber(String buildNumber) { this.buildNumber = buildNumber; return this; }
        public Builder deviceId(String deviceId) { this.deviceId = deviceId; return this; }

        public ClientMetadata build() {
            return new ClientMetadata(clientPlatform, appVersion, buildNumber, deviceId);
        }
    }
}
