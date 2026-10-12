package com.watchtogether.model.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "chat_messages")
public class ChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", nullable = false)
    private WatchRoom room;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id", nullable = false)
    private User sender;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public ChatMessage() {}

    public ChatMessage(Long id, WatchRoom room, User sender, String content, LocalDateTime createdAt) {
        this.id = id;
        this.room = room;
        this.sender = sender;
        this.content = content;
        this.createdAt = createdAt;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private Long id;
        private WatchRoom room;
        private User sender;
        private String content;
        private LocalDateTime createdAt;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder room(WatchRoom room) { this.room = room; return this; }
        public Builder sender(User sender) { this.sender = sender; return this; }
        public Builder content(String content) { this.content = content; return this; }
        public Builder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        public ChatMessage build() {
            return new ChatMessage(id, room, sender, content, createdAt);
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public WatchRoom getRoom() { return room; }
    public void setRoom(WatchRoom room) { this.room = room; }

    public User getSender() { return sender; }
    public void setSender(User sender) { this.sender = sender; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
