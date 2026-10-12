package com.watchtogether.model.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "watch_rooms")
public class WatchRoom {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "room_code", nullable = false, unique = true, length = 32)
    private String roomCode;

    @Column(nullable = false)
    private String title;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "host_id", nullable = false)
    private User host;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "partner_id")
    private User partner;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "video_id", nullable = false)
    private Video currentVideo;

    @Column(name = "is_playing")
    private Boolean isPlaying = false;

    @Column(name = "current_position_seconds")
    private Double currentPositionSeconds = 0.0;

    @Column(name = "last_action_timestamp")
    private Long lastActionTimestamp;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public WatchRoom() {}

    public WatchRoom(Long id, String roomCode, String title, User host, User partner, Video currentVideo, Boolean isPlaying, Double currentPositionSeconds, Long lastActionTimestamp, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.roomCode = roomCode;
        this.title = title;
        this.host = host;
        this.partner = partner;
        this.currentVideo = currentVideo;
        this.isPlaying = isPlaying != null ? isPlaying : false;
        this.currentPositionSeconds = currentPositionSeconds != null ? currentPositionSeconds : 0.0;
        this.lastActionTimestamp = lastActionTimestamp;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private Long id;
        private String roomCode;
        private String title;
        private User host;
        private User partner;
        private Video currentVideo;
        private Boolean isPlaying = false;
        private Double currentPositionSeconds = 0.0;
        private Long lastActionTimestamp;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder roomCode(String roomCode) { this.roomCode = roomCode; return this; }
        public Builder title(String title) { this.title = title; return this; }
        public Builder host(User host) { this.host = host; return this; }
        public Builder partner(User partner) { this.partner = partner; return this; }
        public Builder currentVideo(Video currentVideo) { this.currentVideo = currentVideo; return this; }
        public Builder isPlaying(Boolean isPlaying) { this.isPlaying = isPlaying; return this; }
        public Builder currentPositionSeconds(Double currentPositionSeconds) { this.currentPositionSeconds = currentPositionSeconds; return this; }
        public Builder lastActionTimestamp(Long lastActionTimestamp) { this.lastActionTimestamp = lastActionTimestamp; return this; }
        public Builder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public Builder updatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; return this; }

        public WatchRoom build() {
            return new WatchRoom(id, roomCode, title, host, partner, currentVideo, isPlaying, currentPositionSeconds, lastActionTimestamp, createdAt, updatedAt);
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getRoomCode() { return roomCode; }
    public void setRoomCode(String roomCode) { this.roomCode = roomCode; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public User getHost() { return host; }
    public void setHost(User host) { this.host = host; }

    public User getPartner() { return partner; }
    public void setPartner(User partner) { this.partner = partner; }

    public Video getCurrentVideo() { return currentVideo; }
    public void setCurrentVideo(Video currentVideo) { this.currentVideo = currentVideo; }

    public Boolean getIsPlaying() { return isPlaying; }
    public void setIsPlaying(Boolean isPlaying) { this.isPlaying = isPlaying; }

    public Double getCurrentPositionSeconds() { return currentPositionSeconds; }
    public void setCurrentPositionSeconds(Double currentPositionSeconds) { this.currentPositionSeconds = currentPositionSeconds; }

    public Long getLastActionTimestamp() { return lastActionTimestamp; }
    public void setLastActionTimestamp(Long lastActionTimestamp) { this.lastActionTimestamp = lastActionTimestamp; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
