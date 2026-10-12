package com.watchtogether.model.entity;

import com.watchtogether.model.enums.VideoStatus;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "videos")
public class Video {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "genres")
    private String genres;

    @Column(name = "duration_seconds")
    private Double durationSeconds;

    @Column(name = "original_filename")
    private String originalFilename;

    @Column(name = "raw_storage_key")
    private String rawStorageKey;

    @Column(name = "hls_master_key")
    private String hlsMasterKey;

    @Column(name = "hls_master_url")
    private String hlsMasterUrl;

    @Column(name = "thumbnail_key")
    private String thumbnailKey;

    @Column(name = "thumbnail_url")
    private String thumbnailUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private VideoStatus status = VideoStatus.PENDING;

    @Column(name = "file_size_bytes")
    private Long fileSizeBytes;

    @Column(name = "resolutions")
    private String resolutions;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "uploader_id")
    private User uploader;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public Video() {}

    public Video(Long id, String title, String description, String genres, Double durationSeconds, String originalFilename, String rawStorageKey, String hlsMasterKey, String hlsMasterUrl, String thumbnailKey, String thumbnailUrl, VideoStatus status, Long fileSizeBytes, String resolutions, User uploader, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.genres = genres;
        this.durationSeconds = durationSeconds;
        this.originalFilename = originalFilename;
        this.rawStorageKey = rawStorageKey;
        this.hlsMasterKey = hlsMasterKey;
        this.hlsMasterUrl = hlsMasterUrl;
        this.thumbnailKey = thumbnailKey;
        this.thumbnailUrl = thumbnailUrl;
        this.status = status != null ? status : VideoStatus.PENDING;
        this.fileSizeBytes = fileSizeBytes;
        this.resolutions = resolutions;
        this.uploader = uploader;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private Long id;
        private String title;
        private String description;
        private String genres;
        private Double durationSeconds;
        private String originalFilename;
        private String rawStorageKey;
        private String hlsMasterKey;
        private String hlsMasterUrl;
        private String thumbnailKey;
        private String thumbnailUrl;
        private VideoStatus status = VideoStatus.PENDING;
        private Long fileSizeBytes;
        private String resolutions;
        private User uploader;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder title(String title) { this.title = title; return this; }
        public Builder description(String description) { this.description = description; return this; }
        public Builder genres(String genres) { this.genres = genres; return this; }
        public Builder durationSeconds(Double durationSeconds) { this.durationSeconds = durationSeconds; return this; }
        public Builder originalFilename(String originalFilename) { this.originalFilename = originalFilename; return this; }
        public Builder rawStorageKey(String rawStorageKey) { this.rawStorageKey = rawStorageKey; return this; }
        public Builder hlsMasterKey(String hlsMasterKey) { this.hlsMasterKey = hlsMasterKey; return this; }
        public Builder hlsMasterUrl(String hlsMasterUrl) { this.hlsMasterUrl = hlsMasterUrl; return this; }
        public Builder thumbnailKey(String thumbnailKey) { this.thumbnailKey = thumbnailKey; return this; }
        public Builder thumbnailUrl(String thumbnailUrl) { this.thumbnailUrl = thumbnailUrl; return this; }
        public Builder status(VideoStatus status) { this.status = status; return this; }
        public Builder fileSizeBytes(Long fileSizeBytes) { this.fileSizeBytes = fileSizeBytes; return this; }
        public Builder resolutions(String resolutions) { this.resolutions = resolutions; return this; }
        public Builder uploader(User uploader) { this.uploader = uploader; return this; }
        public Builder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public Builder updatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; return this; }

        public Video build() {
            return new Video(id, title, description, genres, durationSeconds, originalFilename, rawStorageKey, hlsMasterKey, hlsMasterUrl, thumbnailKey, thumbnailUrl, status, fileSizeBytes, resolutions, uploader, createdAt, updatedAt);
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getGenres() { return genres; }
    public void setGenres(String genres) { this.genres = genres; }

    public Double getDurationSeconds() { return durationSeconds; }
    public void setDurationSeconds(Double durationSeconds) { this.durationSeconds = durationSeconds; }

    public String getOriginalFilename() { return originalFilename; }
    public void setOriginalFilename(String originalFilename) { this.originalFilename = originalFilename; }

    public String getRawStorageKey() { return rawStorageKey; }
    public void setRawStorageKey(String rawStorageKey) { this.rawStorageKey = rawStorageKey; }

    public String getHlsMasterKey() { return hlsMasterKey; }
    public void setHlsMasterKey(String hlsMasterKey) { this.hlsMasterKey = hlsMasterKey; }

    public String getHlsMasterUrl() { return hlsMasterUrl; }
    public void setHlsMasterUrl(String hlsMasterUrl) { this.hlsMasterUrl = hlsMasterUrl; }

    public String getThumbnailKey() { return thumbnailKey; }
    public void setThumbnailKey(String thumbnailKey) { this.thumbnailKey = thumbnailKey; }

    public String getThumbnailUrl() { return thumbnailUrl; }
    public void setThumbnailUrl(String thumbnailUrl) { this.thumbnailUrl = thumbnailUrl; }

    public VideoStatus getStatus() { return status; }
    public void setStatus(VideoStatus status) { this.status = status; }

    public Long getFileSizeBytes() { return fileSizeBytes; }
    public void setFileSizeBytes(Long fileSizeBytes) { this.fileSizeBytes = fileSizeBytes; }

    public String getResolutions() { return resolutions; }
    public void setResolutions(String resolutions) { this.resolutions = resolutions; }

    public User getUploader() { return uploader; }
    public void setUploader(User uploader) { this.uploader = uploader; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
