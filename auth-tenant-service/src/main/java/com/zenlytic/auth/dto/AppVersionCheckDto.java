package com.zenlytic.auth.dto;

public record AppVersionCheckDto(
        String status, // SUPPORTED, DEPRECATED_WARN, FORCE_UPDATE_REQUIRED
        String clientType,
        String clientVersion,
        String minSupportedVersion,
        String latestVersion,
        String updateUrl,
        String upgradeTitle,
        String upgradeMessage
) {
    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String status;
        private String clientType;
        private String clientVersion;
        private String minSupportedVersion;
        private String latestVersion;
        private String updateUrl;
        private String upgradeTitle;
        private String upgradeMessage;

        public Builder status(String status) { this.status = status; return this; }
        public Builder clientType(String clientType) { this.clientType = clientType; return this; }
        public Builder clientVersion(String clientVersion) { this.clientVersion = clientVersion; return this; }
        public Builder minSupportedVersion(String minSupportedVersion) { this.minSupportedVersion = minSupportedVersion; return this; }
        public Builder latestVersion(String latestVersion) { this.latestVersion = latestVersion; return this; }
        public Builder updateUrl(String updateUrl) { this.updateUrl = updateUrl; return this; }
        public Builder upgradeTitle(String upgradeTitle) { this.upgradeTitle = upgradeTitle; return this; }
        public Builder upgradeMessage(String upgradeMessage) { this.upgradeMessage = upgradeMessage; return this; }

        public AppVersionCheckDto build() {
            return new AppVersionCheckDto(status, clientType, clientVersion, minSupportedVersion, latestVersion, updateUrl, upgradeTitle, upgradeMessage);
        }
    }
}
