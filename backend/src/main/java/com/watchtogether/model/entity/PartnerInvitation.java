package com.watchtogether.model.entity;

import com.watchtogether.model.enums.InvitationStatus;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "partner_invitations")
public class PartnerInvitation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 16)
    private String code;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id", nullable = false)
    private User sender;

    @Column(name = "recipient_email")
    private String recipientEmail;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private InvitationStatus status = InvitationStatus.PENDING;

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public PartnerInvitation() {}

    public PartnerInvitation(Long id, String code, User sender, String recipientEmail, InvitationStatus status, LocalDateTime expiresAt, LocalDateTime createdAt) {
        this.id = id;
        this.code = code;
        this.sender = sender;
        this.recipientEmail = recipientEmail;
        this.status = status != null ? status : InvitationStatus.PENDING;
        this.expiresAt = expiresAt;
        this.createdAt = createdAt;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private Long id;
        private String code;
        private User sender;
        private String recipientEmail;
        private InvitationStatus status = InvitationStatus.PENDING;
        private LocalDateTime expiresAt;
        private LocalDateTime createdAt;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder code(String code) { this.code = code; return this; }
        public Builder sender(User sender) { this.sender = sender; return this; }
        public Builder recipientEmail(String recipientEmail) { this.recipientEmail = recipientEmail; return this; }
        public Builder status(InvitationStatus status) { this.status = status; return this; }
        public Builder expiresAt(LocalDateTime expiresAt) { this.expiresAt = expiresAt; return this; }
        public Builder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        public PartnerInvitation build() {
            return new PartnerInvitation(id, code, sender, recipientEmail, status, expiresAt, createdAt);
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public User getSender() { return sender; }
    public void setSender(User sender) { this.sender = sender; }

    public String getRecipientEmail() { return recipientEmail; }
    public void setRecipientEmail(String recipientEmail) { this.recipientEmail = recipientEmail; }

    public InvitationStatus getStatus() { return status; }
    public void setStatus(InvitationStatus status) { this.status = status; }

    public LocalDateTime getExpiresAt() { return expiresAt; }
    public void setExpiresAt(LocalDateTime expiresAt) { this.expiresAt = expiresAt; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
