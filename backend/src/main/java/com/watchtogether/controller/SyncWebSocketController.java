package com.watchtogether.controller;

import com.watchtogether.model.dto.ChatDtos.ChatMessageDto;
import com.watchtogether.model.dto.SyncDtos.*;
import com.watchtogether.model.entity.User;
import com.watchtogether.model.enums.PlaybackAction;
import com.watchtogether.repository.UserRepository;
import com.watchtogether.service.WatchRoomService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.time.LocalDateTime;

@Controller
public class SyncWebSocketController {

    private static final Logger log = LoggerFactory.getLogger(SyncWebSocketController.class);

    private final SimpMessagingTemplate messagingTemplate;
    private final WatchRoomService watchRoomService;
    private final UserRepository userRepository;

    public SyncWebSocketController(SimpMessagingTemplate messagingTemplate, WatchRoomService watchRoomService, UserRepository userRepository) {
        this.messagingTemplate = messagingTemplate;
        this.watchRoomService = watchRoomService;
        this.userRepository = userRepository;
    }

    @MessageMapping("/room/{roomCode}/sync")
    public void handlePlaybackSync(
            @DestinationVariable String roomCode,
            @Payload PlaybackSyncMessage message
    ) {
        long now = System.currentTimeMillis();
        message.setRoomCode(roomCode);
        message.setServerTimestamp(now);

        if (message.getAction() == PlaybackAction.PLAY) {
            watchRoomService.updatePlaybackState(roomCode, message.getCurrentPosition(), true);
        } else if (message.getAction() == PlaybackAction.PAUSE || message.getAction() == PlaybackAction.SEEK) {
            watchRoomService.updatePlaybackState(roomCode, message.getCurrentPosition(), false);
        }

        messagingTemplate.convertAndSend("/topic/room/" + roomCode + "/sync", message);
    }

    @MessageMapping("/room/{roomCode}/chat")
    public void handleChatMessage(
            @DestinationVariable String roomCode,
            @Payload ChatMessageDto incomingMessage
    ) {
        ChatMessageDto savedMessage = incomingMessage;
        if (incomingMessage.getSenderId() != null) {
            User sender = userRepository.findById(incomingMessage.getSenderId()).orElse(null);
            if (sender != null) {
                savedMessage = watchRoomService.saveChatMessage(roomCode, sender, incomingMessage.getContent());
            }
        }

        if (savedMessage.getTimestamp() == null) {
            savedMessage.setTimestamp(LocalDateTime.now());
        }

        messagingTemplate.convertAndSend("/topic/room/" + roomCode + "/chat", savedMessage);
    }

    @MessageMapping("/room/{roomCode}/presence")
    public void handlePresence(
            @DestinationVariable String roomCode,
            @Payload PresenceMessage presence
    ) {
        presence.setRoomCode(roomCode);
        presence.setTimestamp(System.currentTimeMillis());
        messagingTemplate.convertAndSend("/topic/room/" + roomCode + "/presence", presence);
    }

    @MessageMapping("/room/{roomCode}/typing")
    public void handleTyping(
            @DestinationVariable String roomCode,
            @Payload TypingMessage typing
    ) {
        typing.setRoomCode(roomCode);
        messagingTemplate.convertAndSend("/topic/room/" + roomCode + "/typing", typing);
    }
}
