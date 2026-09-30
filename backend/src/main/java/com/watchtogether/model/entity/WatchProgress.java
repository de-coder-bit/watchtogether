package com.watchtogether.model.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "watch_progress", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "video_id"})
})
public class WatchProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "video_id", nullable = false)
    private Video video;

    @Column(name = "progress_seconds", nullable = false)
    private Double progressSeconds = 0.0;

    @Column(name = "completed")
    private Boolean completed = false;

    @UpdateTimestamp
    @Column(name = "last_watched_at")
    private LocalDateTime lastWatchedAt;

    public WatchProgress() {}

    public WatchProgress(Long id, User user, Video video, Double progressSeconds, Boolean completed, LocalDateTime lastWatchedAt) {
        this.id = id;
        this.user = user;
        this.video = video;
        this.progressSeconds = progressSeconds != null ? progressSeconds : 0.0;
        this.completed = completed != null ? completed : false;
        this.lastWatchedAt = lastWatchedAt;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private Long id;
        private User user;
        private Video video;
        private Double progressSeconds = 0.0;
        private Boolean completed = false;
        private LocalDateTime lastWatchedAt;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder user(User user) { this.user = user; return this; }
        public Builder video(Video video) { this.video = video; return this; }
        public Builder progressSeconds(Double progressSeconds) { this.progressSeconds = progressSeconds; return this; }
        public Builder completed(Boolean completed) { this.completed = completed; return this; }
        public Builder lastWatchedAt(LocalDateTime lastWatchedAt) { this.lastWatchedAt = lastWatchedAt; return this; }

        public WatchProgress build() {
            return new WatchProgress(id, user, video, progressSeconds, completed, lastWatchedAt);
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public Video getVideo() { return video; }
    public void setVideo(Video video) { this.video = video; }

    public Double getProgressSeconds() { return progressSeconds; }
    public void setProgressSeconds(Double progressSeconds) { this.progressSeconds = progressSeconds; }

    public Boolean getCompleted() { return completed; }
    public void setCompleted(Boolean completed) { this.completed = completed; }

    public LocalDateTime getLastWatchedAt() { return lastWatchedAt; }
    public void setLastWatchedAt(LocalDateTime lastWatchedAt) { this.lastWatchedAt = lastWatchedAt; }
}
