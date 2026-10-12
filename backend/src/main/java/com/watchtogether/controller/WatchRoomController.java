package com.watchtogether.controller;

import com.watchtogether.model.dto.ChatDtos.*;
import com.watchtogether.model.dto.WatchRoomDtos.*;
import com.watchtogether.model.entity.User;
import com.watchtogether.service.WatchRoomService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rooms")
public class WatchRoomController {

    private final WatchRoomService watchRoomService;
    private final SimpMessagingTemplate messagingTemplate;

    public WatchRoomController(WatchRoomService watchRoomService, SimpMessagingTemplate messagingTemplate) {
        this.watchRoomService = watchRoomService;
        this.messagingTemplate = messagingTemplate;
    }

    @PostMapping
    public ResponseEntity<RoomResponse> createRoom(
            @Valid @RequestBody CreateRoomRequest request,
            @AuthenticationPrincipal User currentUser) {
        RoomResponse response = watchRoomService.createRoom(request, currentUser);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{roomCode}")
    public ResponseEntity<RoomResponse> getRoom(
            @PathVariable String roomCode,
            @AuthenticationPrincipal User currentUser) {
        RoomResponse response = watchRoomService.getRoomByCode(roomCode, currentUser);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{roomCode}/join")
    public ResponseEntity<RoomResponse> joinRoom(
            @PathVariable String roomCode,
            @AuthenticationPrincipal User currentUser) {
        RoomResponse response = watchRoomService.joinRoom(roomCode, currentUser);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/my")
    public ResponseEntity<List<RoomResponse>> getMyRooms(@AuthenticationPrincipal User currentUser) {
        List<RoomResponse> rooms = watchRoomService.getUserRooms(currentUser);
        return ResponseEntity.ok(rooms);
    }

    @GetMapping("/{roomCode}/messages")
    public ResponseEntity<List<ChatMessageDto>> getChatMessages(
            @PathVariable String roomCode,
            @RequestParam(defaultValue = "50") int limit) {
        List<ChatMessageDto> messages = watchRoomService.getChatHistory(roomCode, limit);
        return ResponseEntity.ok(messages);
    }

    @PostMapping("/{roomCode}/messages")
    public ResponseEntity<ChatMessageDto> sendChatMessage(
            @PathVariable String roomCode,
            @Valid @RequestBody ChatMessageRequest request,
            @AuthenticationPrincipal User currentUser) {
        ChatMessageDto message = watchRoomService.saveChatMessage(roomCode, request, currentUser);
        // Also broadcast via WebSocket to room topic
        messagingTemplate.convertAndSend("/topic/room/" + roomCode + "/chat", message);
        return ResponseEntity.status(HttpStatus.CREATED).body(message);
    }
}
