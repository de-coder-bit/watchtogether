package com.watchtogether.model.dto;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

public class WatchRoomDtos {

    public static class CreateRoomRequest {
        @NotNull(message = "Video ID is required")
        private Long videoId;
        private String title;

        public CreateRoomRequest() {}
        public CreateRoomRequest(Long videoId, String title) {
            this.videoId = videoId;
            this.title = title;
        }

        public Long getVideoId() { return videoId; }
        public void setVideoId(Long videoId) { this.videoId = videoId; }
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
    }

    public static class RoomResponse {
        private Long id;
        private String roomCode;
        private String title;
        private AuthDtos.UserDto host;
        private AuthDtos.UserDto partner;
        private VideoDtos.VideoResponse video;
        private Boolean isPlaying;
        private Double currentPositionSeconds;
        private Long lastActionTimestamp;
        private LocalDateTime createdAt;

        public RoomResponse() {}

        public RoomResponse(Long id, String roomCode, String title, AuthDtos.UserDto host, AuthDtos.UserDto partner, VideoDtos.VideoResponse video, Boolean isPlaying, Double currentPositionSeconds, Long lastActionTimestamp, LocalDateTime createdAt) {
            this.id = id;
            this.roomCode = roomCode;
            this.title = title;
            this.host = host;
            this.partner = partner;
            this.video = video;
            this.isPlaying = isPlaying;
            this.currentPositionSeconds = currentPositionSeconds;
            this.lastActionTimestamp = lastActionTimestamp;
            this.createdAt = createdAt;
        }

        public static Builder builder() { return new Builder(); }

        public static class Builder {
            private Long id;
            private String roomCode;
            private String title;
            private AuthDtos.UserDto host;
            private AuthDtos.UserDto partner;
            private VideoDtos.VideoResponse video;
            private Boolean isPlaying;
            private Double currentPositionSeconds;
            private Long lastActionTimestamp;
            private LocalDateTime createdAt;

            public Builder id(Long id) { this.id = id; return this; }
            public Builder roomCode(String roomCode) { this.roomCode = roomCode; return this; }
            public Builder title(String title) { this.title = title; return this; }
            public Builder host(AuthDtos.UserDto host) { this.host = host; return this; }
            public Builder partner(AuthDtos.UserDto partner) { this.partner = partner; return this; }
            public Builder video(VideoDtos.VideoResponse video) { this.video = video; return this; }
            public Builder isPlaying(Boolean isPlaying) { this.isPlaying = isPlaying; return this; }
            public Builder currentPositionSeconds(Double currentPositionSeconds) { this.currentPositionSeconds = currentPositionSeconds; return this; }
            public Builder lastActionTimestamp(Long lastActionTimestamp) { this.lastActionTimestamp = lastActionTimestamp; return this; }
            public Builder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

            public RoomResponse build() {
                return new RoomResponse(id, roomCode, title, host, partner, video, isPlaying, currentPositionSeconds, lastActionTimestamp, createdAt);
            }
        }

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getRoomCode() { return roomCode; }
        public void setRoomCode(String roomCode) { this.roomCode = roomCode; }
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public AuthDtos.UserDto getHost() { return host; }
        public void setHost(AuthDtos.UserDto host) { this.host = host; }
        public AuthDtos.UserDto getPartner() { return partner; }
        public void setPartner(AuthDtos.UserDto partner) { this.partner = partner; }
        public VideoDtos.VideoResponse getVideo() { return video; }
        public void setVideo(VideoDtos.VideoResponse video) { this.video = video; }
        public Boolean getIsPlaying() { return isPlaying; }
        public void setIsPlaying(Boolean isPlaying) { this.isPlaying = isPlaying; }
        public Double getCurrentPositionSeconds() { return currentPositionSeconds; }
        public void setCurrentPositionSeconds(Double currentPositionSeconds) { this.currentPositionSeconds = currentPositionSeconds; }
        public Long getLastActionTimestamp() { return lastActionTimestamp; }
        public void setLastActionTimestamp(Long lastActionTimestamp) { this.lastActionTimestamp = lastActionTimestamp; }
        public LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    }

    public static class RoomStateUpdateRequest {
        private Boolean isPlaying;
        private Double currentPositionSeconds;

        public RoomStateUpdateRequest() {}
        public RoomStateUpdateRequest(Boolean isPlaying, Double currentPositionSeconds) {
            this.isPlaying = isPlaying;
            this.currentPositionSeconds = currentPositionSeconds;
        }

        public Boolean getIsPlaying() { return isPlaying; }
        public void setIsPlaying(Boolean isPlaying) { this.isPlaying = isPlaying; }
        public Double getCurrentPositionSeconds() { return currentPositionSeconds; }
        public void setCurrentPositionSeconds(Double currentPositionSeconds) { this.currentPositionSeconds = currentPositionSeconds; }
    }
}
