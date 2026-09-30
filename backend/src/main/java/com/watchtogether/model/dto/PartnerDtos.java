package com.watchtogether.model.dto;

import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;

public class PartnerDtos {

    public static class PartnerInviteResponse {
        private String inviteCode;
        private LocalDateTime expiresAt;
        private String inviteUrl;

        public PartnerInviteResponse() {}

        public PartnerInviteResponse(String inviteCode, LocalDateTime expiresAt, String inviteUrl) {
            this.inviteCode = inviteCode;
            this.expiresAt = expiresAt;
            this.inviteUrl = inviteUrl;
        }

        public static Builder builder() { return new Builder(); }

        public static class Builder {
            private String inviteCode;
            private LocalDateTime expiresAt;
            private String inviteUrl;

            public Builder inviteCode(String inviteCode) { this.inviteCode = inviteCode; return this; }
            public Builder expiresAt(LocalDateTime expiresAt) { this.expiresAt = expiresAt; return this; }
            public Builder inviteUrl(String inviteUrl) { this.inviteUrl = inviteUrl; return this; }

            public PartnerInviteResponse build() {
                return new PartnerInviteResponse(inviteCode, expiresAt, inviteUrl);
            }
        }

        public String getInviteCode() { return inviteCode; }
        public void setInviteCode(String inviteCode) { this.inviteCode = inviteCode; }
        public LocalDateTime getExpiresAt() { return expiresAt; }
        public void setExpiresAt(LocalDateTime expiresAt) { this.expiresAt = expiresAt; }
        public String getInviteUrl() { return inviteUrl; }
        public void setInviteUrl(String inviteUrl) { this.inviteUrl = inviteUrl; }
    }

    public static class PairRequest {
        @NotBlank(message = "Invite code is required")
        private String inviteCode;

        public PairRequest() {}
        public PairRequest(String inviteCode) { this.inviteCode = inviteCode; }

        public String getInviteCode() { return inviteCode; }
        public void setInviteCode(String inviteCode) { this.inviteCode = inviteCode; }
    }

    public static class PartnerStatusResponse {
        private boolean isPaired;
        private AuthDtos.PartnerDto partner;
        private String activeInviteCode;
        private LocalDateTime inviteExpiresAt;

        public PartnerStatusResponse() {}

        public PartnerStatusResponse(boolean isPaired, AuthDtos.PartnerDto partner, String activeInviteCode, LocalDateTime inviteExpiresAt) {
            this.isPaired = isPaired;
            this.partner = partner;
            this.activeInviteCode = activeInviteCode;
            this.inviteExpiresAt = inviteExpiresAt;
        }

        public static Builder builder() { return new Builder(); }

        public static class Builder {
            private boolean isPaired;
            private AuthDtos.PartnerDto partner;
            private String activeInviteCode;
            private LocalDateTime inviteExpiresAt;

            public Builder isPaired(boolean isPaired) { this.isPaired = isPaired; return this; }
            public Builder partner(AuthDtos.PartnerDto partner) { this.partner = partner; return this; }
            public Builder activeInviteCode(String activeInviteCode) { this.activeInviteCode = activeInviteCode; return this; }
            public Builder inviteExpiresAt(LocalDateTime inviteExpiresAt) { this.inviteExpiresAt = inviteExpiresAt; return this; }

            public PartnerStatusResponse build() {
                return new PartnerStatusResponse(isPaired, partner, activeInviteCode, inviteExpiresAt);
            }
        }

        public boolean isPaired() { return isPaired; }
        public void setPaired(boolean paired) { isPaired = paired; }
        public AuthDtos.PartnerDto getPartner() { return partner; }
        public void setPartner(AuthDtos.PartnerDto partner) { this.partner = partner; }
        public String getActiveInviteCode() { return activeInviteCode; }
        public void setActiveInviteCode(String activeInviteCode) { this.activeInviteCode = activeInviteCode; }
        public LocalDateTime getInviteExpiresAt() { return inviteExpiresAt; }
        public void setInviteExpiresAt(LocalDateTime inviteExpiresAt) { this.inviteExpiresAt = inviteExpiresAt; }
    }
}
