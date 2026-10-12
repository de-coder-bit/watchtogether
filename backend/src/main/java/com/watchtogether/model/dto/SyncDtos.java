package com.watchtogether.model.dto;

import com.watchtogether.model.enums.PlaybackAction;
import java.time.LocalDateTime;

public class SyncDtos {

    public static class PlaybackSyncMessage {
        private String roomCode;
        private Long senderId;
        private String senderName;
        private PlaybackAction action;
        private Double currentPosition;
        private Double playbackRate;
        private Long clientTimestamp;
        private Long serverTimestamp;

        public PlaybackSyncMessage() {}

        public PlaybackSyncMessage(String roomCode, Long senderId, String senderName, PlaybackAction action, Double currentPosition, Double playbackRate, Long clientTimestamp, Long serverTimestamp) {
            this.roomCode = roomCode;
            this.senderId = senderId;
            this.senderName = senderName;
            this.action = action;
            this.currentPosition = currentPosition;
            this.playbackRate = playbackRate;
            this.clientTimestamp = clientTimestamp;
            this.serverTimestamp = serverTimestamp;
        }

        public static Builder builder() { return new Builder(); }

        public static class Builder {
            private String roomCode;
            private Long senderId;
            private String senderName;
            private PlaybackAction action;
            private Double currentPosition;
            private Double playbackRate = 1.0;
            private Long clientTimestamp;
            private Long serverTimestamp;

            public Builder roomCode(String roomCode) { this.roomCode = roomCode; return this; }
            public Builder senderId(Long senderId) { this.senderId = senderId; return this; }
            public Builder senderName(String senderName) { this.senderName = senderName; return this; }
            public Builder action(PlaybackAction action) { this.action = action; return this; }
            public Builder currentPosition(Double currentPosition) { this.currentPosition = currentPosition; return this; }
            public Builder playbackRate(Double playbackRate) { this.playbackRate = playbackRate; return this; }
            public Builder clientTimestamp(Long clientTimestamp) { this.clientTimestamp = clientTimestamp; return this; }
            public Builder serverTimestamp(Long serverTimestamp) { this.serverTimestamp = serverTimestamp; return this; }

            public PlaybackSyncMessage build() {
                return new PlaybackSyncMessage(roomCode, senderId, senderName, action, currentPosition, playbackRate, clientTimestamp, serverTimestamp);
            }
        }

        public String getRoomCode() { return roomCode; }
        public void setRoomCode(String roomCode) { this.roomCode = roomCode; }
        public Long getSenderId() { return senderId; }
        public void setSenderId(Long senderId) { this.senderId = senderId; }
        public String getSenderName() { return senderName; }
        public void setSenderName(String senderName) { this.senderName = senderName; }
        public PlaybackAction getAction() { return action; }
        public void setAction(PlaybackAction action) { this.action = action; }
        public Double getCurrentPosition() { return currentPosition; }
        public void setCurrentPosition(Double currentPosition) { this.currentPosition = currentPosition; }
        public Double getPlaybackRate() { return playbackRate; }
        public void setPlaybackRate(Double playbackRate) { this.playbackRate = playbackRate; }
        public Long getClientTimestamp() { return clientTimestamp; }
        public void setClientTimestamp(Long clientTimestamp) { this.clientTimestamp = clientTimestamp; }
        public Long getServerTimestamp() { return serverTimestamp; }
        public void setServerTimestamp(Long serverTimestamp) { this.serverTimestamp = serverTimestamp; }
    }

    public static class PresenceMessage {
        private String roomCode;
        private Long userId;
        private String username;
        private String avatarUrl;
        private String status;
        private Long timestamp;

        public PresenceMessage() {}

        public PresenceMessage(String roomCode, Long userId, String username, String avatarUrl, String status, Long timestamp) {
            this.roomCode = roomCode;
            this.userId = userId;
            this.username = username;
            this.avatarUrl = avatarUrl;
            this.status = status;
            this.timestamp = timestamp;
        }

        public static Builder builder() { return new Builder(); }

        public static class Builder {
            private String roomCode;
            private Long userId;
            private String username;
            private String avatarUrl;
            private String status;
            private Long timestamp;

            public Builder roomCode(String roomCode) { this.roomCode = roomCode; return this; }
            public Builder userId(Long userId) { this.userId = userId; return this; }
            public Builder username(String username) { this.username = username; return this; }
            public Builder avatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; return this; }
            public Builder status(String status) { this.status = status; return this; }
            public Builder timestamp(Long timestamp) { this.timestamp = timestamp; return this; }

            public PresenceMessage build() {
                return new PresenceMessage(roomCode, userId, username, avatarUrl, status, timestamp);
            }
        }

        public String getRoomCode() { return roomCode; }
        public void setRoomCode(String roomCode) { this.roomCode = roomCode; }
        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }
        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        public String getAvatarUrl() { return avatarUrl; }
        public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public Long getTimestamp() { return timestamp; }
        public void setTimestamp(Long timestamp) { this.timestamp = timestamp; }
    }

    public static class TypingMessage {
        private String roomCode;
        private Long userId;
        private String username;
        private boolean isTyping;

        public TypingMessage() {}

        public TypingMessage(String roomCode, Long userId, String username, boolean isTyping) {
            this.roomCode = roomCode;
            this.userId = userId;
            this.username = username;
            this.isTyping = isTyping;
        }

        public static Builder builder() { return new Builder(); }

        public static class Builder {
            private String roomCode;
            private Long userId;
            private String username;
            private boolean isTyping;

            public Builder roomCode(String roomCode) { this.roomCode = roomCode; return this; }
            public Builder userId(Long userId) { this.userId = userId; return this; }
            public Builder username(String username) { this.username = username; return this; }
            public Builder isTyping(boolean isTyping) { this.isTyping = isTyping; return this; }

            public TypingMessage build() {
                return new TypingMessage(roomCode, userId, username, isTyping);
            }
        }

        public String getRoomCode() { return roomCode; }
        public void setRoomCode(String roomCode) { this.roomCode = roomCode; }
        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }
        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        public boolean isTyping() { return isTyping; }
        public void setTyping(boolean typing) { isTyping = typing; }
    }

    public static class WatchProgressRequest {
        private Long videoId;
        private Double progressSeconds;
        private Boolean completed;

        public WatchProgressRequest() {}

        public WatchProgressRequest(Long videoId, Double progressSeconds, Boolean completed) {
            this.videoId = videoId;
            this.progressSeconds = progressSeconds;
            this.completed = completed;
        }

        public static Builder builder() { return new Builder(); }

        public static class Builder {
            private Long videoId;
            private Double progressSeconds;
            private Boolean completed;

            public Builder videoId(Long videoId) { this.videoId = videoId; return this; }
            public Builder progressSeconds(Double progressSeconds) { this.progressSeconds = progressSeconds; return this; }
            public Builder completed(Boolean completed) { this.completed = completed; return this; }

            public WatchProgressRequest build() {
                return new WatchProgressRequest(videoId, progressSeconds, completed);
            }
        }

        public Long getVideoId() { return videoId; }
        public void setVideoId(Long videoId) { this.videoId = videoId; }
        public Double getProgressSeconds() { return progressSeconds; }
        public void setProgressSeconds(Double progressSeconds) { this.progressSeconds = progressSeconds; }
        public Boolean getCompleted() { return completed; }
        public void setCompleted(Boolean completed) { this.completed = completed; }
    }

    public static class WatchProgressDto {
        private Long id;
        private Long videoId;
        private String videoTitle;
        private String videoThumbnailUrl;
        private Double durationSeconds;
        private Double progressSeconds;
        private Double percentComplete;
        private Boolean completed;
        private LocalDateTime lastWatchedAt;

        public WatchProgressDto() {}

        public WatchProgressDto(Long id, Long videoId, String videoTitle, String videoThumbnailUrl, Double durationSeconds, Double progressSeconds, Double percentComplete, Boolean completed, LocalDateTime lastWatchedAt) {
            this.id = id;
            this.videoId = videoId;
            this.videoTitle = videoTitle;
            this.videoThumbnailUrl = videoThumbnailUrl;
            this.durationSeconds = durationSeconds;
            this.progressSeconds = progressSeconds;
            this.percentComplete = percentComplete;
            this.completed = completed;
            this.lastWatchedAt = lastWatchedAt;
        }

        public static Builder builder() { return new Builder(); }

        public static class Builder {
            private Long id;
            private Long videoId;
            private String videoTitle;
            private String videoThumbnailUrl;
            private Double durationSeconds;
            private Double progressSeconds;
            private Double percentComplete;
            private Boolean completed;
            private LocalDateTime lastWatchedAt;

            public Builder id(Long id) { this.id = id; return this; }
            public Builder videoId(Long videoId) { this.videoId = videoId; return this; }
            public Builder videoTitle(String videoTitle) { this.videoTitle = videoTitle; return this; }
            public Builder videoThumbnailUrl(String videoThumbnailUrl) { this.videoThumbnailUrl = videoThumbnailUrl; return this; }
            public Builder durationSeconds(Double durationSeconds) { this.durationSeconds = durationSeconds; return this; }
            public Builder progressSeconds(Double progressSeconds) { this.progressSeconds = progressSeconds; return this; }
            public Builder percentComplete(Double percentComplete) { this.percentComplete = percentComplete; return this; }
            public Builder completed(Boolean completed) { this.completed = completed; return this; }
            public Builder lastWatchedAt(LocalDateTime lastWatchedAt) { this.lastWatchedAt = lastWatchedAt; return this; }

            public WatchProgressDto build() {
                return new WatchProgressDto(id, videoId, videoTitle, videoThumbnailUrl, durationSeconds, progressSeconds, percentComplete, completed, lastWatchedAt);
            }
        }

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public Long getVideoId() { return videoId; }
        public void setVideoId(Long videoId) { this.videoId = videoId; }
        public String getVideoTitle() { return videoTitle; }
        public void setVideoTitle(String videoTitle) { this.videoTitle = videoTitle; }
        public String getVideoThumbnailUrl() { return videoThumbnailUrl; }
        public void setVideoThumbnailUrl(String videoThumbnailUrl) { this.videoThumbnailUrl = videoThumbnailUrl; }
        public Double getDurationSeconds() { return durationSeconds; }
        public void setDurationSeconds(Double durationSeconds) { this.durationSeconds = durationSeconds; }
        public Double getProgressSeconds() { return progressSeconds; }
        public void setProgressSeconds(Double progressSeconds) { this.progressSeconds = progressSeconds; }
        public Double getPercentComplete() { return percentComplete; }
        public void setPercentComplete(Double percentComplete) { this.percentComplete = percentComplete; }
        public Boolean getCompleted() { return completed; }
        public void setCompleted(Boolean completed) { this.completed = completed; }
        public LocalDateTime getLastWatchedAt() { return lastWatchedAt; }
        public void setLastWatchedAt(LocalDateTime lastWatchedAt) { this.lastWatchedAt = lastWatchedAt; }
    }
}
