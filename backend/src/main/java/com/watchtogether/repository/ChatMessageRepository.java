package com.watchtogether.repository;

import com.watchtogether.model.entity.ChatMessage;
import com.watchtogether.model.entity.WatchRoom;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    List<ChatMessage> findByRoomOrderByCreatedAtAsc(WatchRoom room);
    List<ChatMessage> findByRoomOrderByCreatedAtDesc(WatchRoom room, Pageable pageable);
}
