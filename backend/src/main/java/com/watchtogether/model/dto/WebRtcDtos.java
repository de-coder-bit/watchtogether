package com.watchtogether.model.dto;

public class WebRtcDtos {

    public enum SignalType {
        OFFER,
        ANSWER,
        ICE_CANDIDATE,
        CALL_STATE,
        LEAVE_CALL
    }

    public static class WebRtcSignalMessage {
        private String roomCode;
        private Long senderId;
        private String senderName;
        private SignalType type;
        private Object data; // SDP JSON or ICE candidate object or call state

        public WebRtcSignalMessage() {}

        public WebRtcSignalMessage(String roomCode, Long senderId, String senderName, SignalType type, Object data) {
            this.roomCode = roomCode;
            this.senderId = senderId;
            this.senderName = senderName;
            this.type = type;
            this.data = data;
        }

        public static Builder builder() { return new Builder(); }

        public static class Builder {
            private String roomCode;
            private Long senderId;
            private String senderName;
            private SignalType type;
            private Object data;

            public Builder roomCode(String roomCode) { this.roomCode = roomCode; return this; }
            public Builder senderId(Long senderId) { this.senderId = senderId; return this; }
            public Builder senderName(String senderName) { this.senderName = senderName; return this; }
            public Builder type(SignalType type) { this.type = type; return this; }
            public Builder data(Object data) { this.data = data; return this; }

            public WebRtcSignalMessage build() {
                return new WebRtcSignalMessage(roomCode, senderId, senderName, type, data);
            }
        }

        public String getRoomCode() { return roomCode; }
        public void setRoomCode(String roomCode) { this.roomCode = roomCode; }
        public Long getSenderId() { return senderId; }
        public void setSenderId(Long senderId) { this.senderId = senderId; }
        public String getSenderName() { return senderName; }
        public void setSenderName(String senderName) { this.senderName = senderName; }
        public SignalType getType() { return type; }
        public void setType(SignalType type) { this.type = type; }
        public Object getData() { return data; }
        public void setData(Object data) { this.data = data; }
    }
}
