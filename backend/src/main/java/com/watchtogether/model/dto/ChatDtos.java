package com.watchtogether.model.dto;

import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;

public class ChatDtos {

    public static class ChatMessageRequest {
        @NotBlank(message = "Message content cannot be empty")
        private String content;

        public ChatMessageRequest() {}
        public ChatMessageRequest(String content) { this.content = content; }

        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }
    }

    public static class ChatMessageDto {
        private Long id;
        private String roomCode;
        private Long senderId;
        private String senderName;
        private String senderAvatar;
        private String content;
        private LocalDateTime timestamp;

        public ChatMessageDto() {}

        public ChatMessageDto(Long id, String roomCode, Long senderId, String senderName, String senderAvatar, String content, LocalDateTime timestamp) {
            this.id = id;
            this.roomCode = roomCode;
            this.senderId = senderId;
            this.senderName = senderName;
            this.senderAvatar = senderAvatar;
            this.content = content;
            this.timestamp = timestamp;
        }

        public static Builder builder() { return new Builder(); }

        public static class Builder {
            private Long id;
            private String roomCode;
            private Long senderId;
            private String senderName;
            private String senderAvatar;
            private String content;
            private LocalDateTime timestamp;

            public Builder id(Long id) { this.id = id; return this; }
            public Builder roomCode(String roomCode) { this.roomCode = roomCode; return this; }
            public Builder senderId(Long senderId) { this.senderId = senderId; return this; }
            public Builder senderName(String senderName) { this.senderName = senderName; return this; }
            public Builder senderAvatar(String senderAvatar) { this.senderAvatar = senderAvatar; return this; }
            public Builder content(String content) { this.content = content; return this; }
            public Builder timestamp(LocalDateTime timestamp) { this.timestamp = timestamp; return this; }

            public ChatMessageDto build() {
                return new ChatMessageDto(id, roomCode, senderId, senderName, senderAvatar, content, timestamp);
            }
        }

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getRoomCode() { return roomCode; }
        public void setRoomCode(String roomCode) { this.roomCode = roomCode; }
        public Long getSenderId() { return senderId; }
        public void setSenderId(Long senderId) { this.senderId = senderId; }
        public String getSenderName() { return senderName; }
        public void setSenderName(String senderName) { this.senderName = senderName; }
        public String getSenderAvatar() { return senderAvatar; }
        public void setSenderAvatar(String senderAvatar) { this.senderAvatar = senderAvatar; }
        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }
        public LocalDateTime getTimestamp() { return timestamp; }
        public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
    }
}
