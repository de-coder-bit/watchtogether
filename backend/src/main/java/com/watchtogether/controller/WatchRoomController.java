package com.watchtogether.controller;

import com.watchtogether.model.dto.ChatDtos.*;
import com.watchtogether.model.dto.WatchRoomDtos.*;
import com.watchtogether.model.entity.User;
import com.watchtogether.service.WatchRoomService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rooms")
public class WatchRoomController {

    private final WatchRoomService watchRoomService;

    public WatchRoomController(WatchRoomService watchRoomService) {
        this.watchRoomService = watchRoomService;
    }

    @PostMapping("/create")
    public ResponseEntity<RoomResponse> createRoom(
            @AuthenticationPrincipal User currentUser,
            @Valid @RequestBody CreateRoomRequest request
    ) {
        RoomResponse response = watchRoomService.createRoom(currentUser, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{code}")
    public ResponseEntity<RoomResponse> getRoom(
            @PathVariable("code") String roomCode,
            @AuthenticationPrincipal User currentUser
    ) {
        RoomResponse response = watchRoomService.getRoomByCode(roomCode, currentUser);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{code}/state")
    public ResponseEntity<Void> updateRoomState(
            @PathVariable("code") String roomCode,
            @RequestBody RoomStateUpdateRequest request
    ) {
        watchRoomService.updatePlaybackState(roomCode, request.getCurrentPositionSeconds(), request.getIsPlaying());
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{code}/messages")
    public ResponseEntity<List<ChatMessageDto>> getRoomMessages(@PathVariable("code") String roomCode) {
        List<ChatMessageDto> messages = watchRoomService.getRoomMessages(roomCode);
        return ResponseEntity.ok(messages);
    }

    @PostMapping("/{code}/messages")
    public ResponseEntity<ChatMessageDto> postMessage(
            @PathVariable("code") String roomCode,
            @AuthenticationPrincipal User currentUser,
            @Valid @RequestBody ChatMessageRequest request
    ) {
        ChatMessageDto message = watchRoomService.saveChatMessage(roomCode, currentUser, request.getContent());
        return ResponseEntity.ok(message);
    }
}
