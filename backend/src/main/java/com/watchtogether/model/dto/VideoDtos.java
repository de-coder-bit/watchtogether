package com.watchtogether.model.dto;

import com.watchtogether.model.enums.VideoStatus;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;

public class VideoDtos {

    public static class VideoMetadataRequest {
        @NotBlank(message = "Title is required")
        private String title;
        private String description;
        private String genres;

        public VideoMetadataRequest() {}
        public VideoMetadataRequest(String title, String description, String genres) {
            this.title = title;
            this.description = description;
            this.genres = genres;
        }

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public String getGenres() { return genres; }
        public void setGenres(String genres) { this.genres = genres; }
    }

    public static class VideoResponse {
        private Long id;
        private String title;
        private String description;
        private String genres;
        private Double durationSeconds;
        private String originalFilename;
        private String hlsMasterUrl;
        private String thumbnailUrl;
        private VideoStatus status;
        private Long fileSizeBytes;
        private String resolutions;
        private AuthDtos.UserDto uploader;
        private Integer processingProgress;
        private String errorMessage;
        private Double userResumePosition;
        private LocalDateTime createdAt;

        public VideoResponse() {}

        public VideoResponse(Long id, String title, String description, String genres, Double durationSeconds, String originalFilename, String hlsMasterUrl, String thumbnailUrl, VideoStatus status, Long fileSizeBytes, String resolutions, AuthDtos.UserDto uploader, Integer processingProgress, String errorMessage, Double userResumePosition, LocalDateTime createdAt) {
            this.id = id;
            this.title = title;
            this.description = description;
            this.genres = genres;
            this.durationSeconds = durationSeconds;
            this.originalFilename = originalFilename;
            this.hlsMasterUrl = hlsMasterUrl;
            this.thumbnailUrl = thumbnailUrl;
            this.status = status;
            this.fileSizeBytes = fileSizeBytes;
            this.resolutions = resolutions;
            this.uploader = uploader;
            this.processingProgress = processingProgress;
            this.errorMessage = errorMessage;
            this.userResumePosition = userResumePosition;
            this.createdAt = createdAt;
        }

        public static Builder builder() { return new Builder(); }

        public static class Builder {
            private Long id;
            private String title;
            private String description;
            private String genres;
            private Double durationSeconds;
            private String originalFilename;
            private String hlsMasterUrl;
            private String thumbnailUrl;
            private VideoStatus status;
            private Long fileSizeBytes;
            private String resolutions;
            private AuthDtos.UserDto uploader;
            private Integer processingProgress;
            private String errorMessage;
            private Double userResumePosition;
            private LocalDateTime createdAt;

            public Builder id(Long id) { this.id = id; return this; }
            public Builder title(String title) { this.title = title; return this; }
            public Builder description(String description) { this.description = description; return this; }
            public Builder genres(String genres) { this.genres = genres; return this; }
            public Builder durationSeconds(Double durationSeconds) { this.durationSeconds = durationSeconds; return this; }
            public Builder originalFilename(String originalFilename) { this.originalFilename = originalFilename; return this; }
            public Builder hlsMasterUrl(String hlsMasterUrl) { this.hlsMasterUrl = hlsMasterUrl; return this; }
            public Builder thumbnailUrl(String thumbnailUrl) { this.thumbnailUrl = thumbnailUrl; return this; }
            public Builder status(VideoStatus status) { this.status = status; return this; }
            public Builder fileSizeBytes(Long fileSizeBytes) { this.fileSizeBytes = fileSizeBytes; return this; }
            public Builder resolutions(String resolutions) { this.resolutions = resolutions; return this; }
            public Builder uploader(AuthDtos.UserDto uploader) { this.uploader = uploader; return this; }
            public Builder processingProgress(Integer processingProgress) { this.processingProgress = processingProgress; return this; }
            public Builder errorMessage(String errorMessage) { this.errorMessage = errorMessage; return this; }
            public Builder userResumePosition(Double userResumePosition) { this.userResumePosition = userResumePosition; return this; }
            public Builder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

            public VideoResponse build() {
                return new VideoResponse(id, title, description, genres, durationSeconds, originalFilename, hlsMasterUrl, thumbnailUrl, status, fileSizeBytes, resolutions, uploader, processingProgress, errorMessage, userResumePosition, createdAt);
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
        public String getHlsMasterUrl() { return hlsMasterUrl; }
        public void setHlsMasterUrl(String hlsMasterUrl) { this.hlsMasterUrl = hlsMasterUrl; }
        public String getThumbnailUrl() { return thumbnailUrl; }
        public void setThumbnailUrl(String thumbnailUrl) { this.thumbnailUrl = thumbnailUrl; }
        public VideoStatus getStatus() { return status; }
        public void setStatus(VideoStatus status) { this.status = status; }
        public Long getFileSizeBytes() { return fileSizeBytes; }
        public void setFileSizeBytes(Long fileSizeBytes) { this.fileSizeBytes = fileSizeBytes; }
        public String getResolutions() { return resolutions; }
        public void setResolutions(String resolutions) { this.resolutions = resolutions; }
        public AuthDtos.UserDto getUploader() { return uploader; }
        public void setUploader(AuthDtos.UserDto uploader) { this.uploader = uploader; }
        public Integer getProcessingProgress() { return processingProgress; }
        public void setProcessingProgress(Integer processingProgress) { this.processingProgress = processingProgress; }
        public String getErrorMessage() { return errorMessage; }
        public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }
        public Double getUserResumePosition() { return userResumePosition; }
        public void setUserResumePosition(Double userResumePosition) { this.userResumePosition = userResumePosition; }
        public LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    }

    public static class VideoUploadChunkResponse {
        private String uploadId;
        private Integer chunkIndex;
        private Integer totalChunks;
        private boolean isComplete;
        private VideoResponse video;

        public VideoUploadChunkResponse() {}
        public VideoUploadChunkResponse(String uploadId, Integer chunkIndex, Integer totalChunks, boolean isComplete, VideoResponse video) {
            this.uploadId = uploadId;
            this.chunkIndex = chunkIndex;
            this.totalChunks = totalChunks;
            this.isComplete = isComplete;
            this.video = video;
        }

        public static Builder builder() { return new Builder(); }

        public static class Builder {
            private String uploadId;
            private Integer chunkIndex;
            private Integer totalChunks;
            private boolean isComplete;
            private VideoResponse video;

            public Builder uploadId(String uploadId) { this.uploadId = uploadId; return this; }
            public Builder chunkIndex(Integer chunkIndex) { this.chunkIndex = chunkIndex; return this; }
            public Builder totalChunks(Integer totalChunks) { this.totalChunks = totalChunks; return this; }
            public Builder isComplete(boolean isComplete) { this.isComplete = isComplete; return this; }
            public Builder video(VideoResponse video) { this.video = video; return this; }

            public VideoUploadChunkResponse build() {
                return new VideoUploadChunkResponse(uploadId, chunkIndex, totalChunks, isComplete, video);
            }
        }

        public String getUploadId() { return uploadId; }
        public void setUploadId(String uploadId) { this.uploadId = uploadId; }
        public Integer getChunkIndex() { return chunkIndex; }
        public void setChunkIndex(Integer chunkIndex) { this.chunkIndex = chunkIndex; }
        public Integer getTotalChunks() { return totalChunks; }
        public void setTotalChunks(Integer totalChunks) { this.totalChunks = totalChunks; }
        public boolean isComplete() { return isComplete; }
        public void setComplete(boolean complete) { isComplete = complete; }
        public VideoResponse getVideo() { return video; }
        public void setVideo(VideoResponse video) { this.video = video; }
    }
}
