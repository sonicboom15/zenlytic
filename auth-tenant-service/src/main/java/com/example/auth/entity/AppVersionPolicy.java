package com.example.auth.entity;

import com.example.common.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "app_version_policies")
public class AppVersionPolicy extends BaseEntity {

    @Column(name = "client_type", nullable = false, unique = true, length = 32)
    private String clientType; // iOS, Android

    @Column(name = "min_supported_version", nullable = false, length = 32)
    private String minSupportedVersion;

    @Column(name = "latest_version", nullable = false, length = 32)
    private String latestVersion;

    @Column(name = "update_url", length = 512)
    private String updateUrl;

    @Column(name = "upgrade_title")
    private String upgradeTitle;

    @Column(name = "upgrade_message", length = 1024)
    private String upgradeMessage;

    public AppVersionPolicy() {}

    public AppVersionPolicy(String clientType, String minSupportedVersion, String latestVersion, String updateUrl, String upgradeTitle, String upgradeMessage) {
        this.clientType = clientType;
        this.minSupportedVersion = minSupportedVersion;
        this.latestVersion = latestVersion;
        this.updateUrl = updateUrl;
        this.upgradeTitle = upgradeTitle;
        this.upgradeMessage = upgradeMessage;
    }

    public String getClientType() { return clientType; }
    public void setClientType(String clientType) { this.clientType = clientType; }

    public String getMinSupportedVersion() { return minSupportedVersion; }
    public void setMinSupportedVersion(String minSupportedVersion) { this.minSupportedVersion = minSupportedVersion; }

    public String getLatestVersion() { return latestVersion; }
    public void setLatestVersion(String latestVersion) { this.latestVersion = latestVersion; }

    public String getUpdateUrl() { return updateUrl; }
    public void setUpdateUrl(String updateUrl) { this.updateUrl = updateUrl; }

    public String getUpgradeTitle() { return upgradeTitle; }
    public void setUpgradeTitle(String upgradeTitle) { this.upgradeTitle = upgradeTitle; }

    public String getUpgradeMessage() { return upgradeMessage; }
    public void setUpgradeMessage(String upgradeMessage) { this.upgradeMessage = upgradeMessage; }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String clientType;
        private String minSupportedVersion;
        private String latestVersion;
        private String updateUrl;
        private String upgradeTitle;
        private String upgradeMessage;

        public Builder clientType(String clientType) { this.clientType = clientType; return this; }
        public Builder minSupportedVersion(String minSupportedVersion) { this.minSupportedVersion = minSupportedVersion; return this; }
        public Builder latestVersion(String latestVersion) { this.latestVersion = latestVersion; return this; }
        public Builder updateUrl(String updateUrl) { this.updateUrl = updateUrl; return this; }
        public Builder upgradeTitle(String upgradeTitle) { this.upgradeTitle = upgradeTitle; return this; }
        public Builder upgradeMessage(String upgradeMessage) { this.upgradeMessage = upgradeMessage; return this; }

        public AppVersionPolicy build() {
            return new AppVersionPolicy(clientType, minSupportedVersion, latestVersion, updateUrl, upgradeTitle, upgradeMessage);
        }
    }
}
