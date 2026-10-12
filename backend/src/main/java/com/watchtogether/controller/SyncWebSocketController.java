package com.watchtogether.controller;

import com.watchtogether.model.dto.ChatDtos.ChatMessageDto;
import com.watchtogether.model.dto.SyncDtos.*;
import com.watchtogether.model.dto.WebRtcDtos.*;
import com.watchtogether.model.enums.PlaybackAction;
import com.watchtogether.service.WatchRoomService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
public class SyncWebSocketController {

    private static final Logger log = LoggerFactory.getLogger(SyncWebSocketController.class);

    private final SimpMessagingTemplate messagingTemplate;
    private final WatchRoomService watchRoomService;

    public SyncWebSocketController(SimpMessagingTemplate messagingTemplate, WatchRoomService watchRoomService) {
        this.messagingTemplate = messagingTemplate;
        this.watchRoomService = watchRoomService;
    }

    /**
     * Broadcasts video player synchronization actions (PLAY, PAUSE, SEEK, RATE_CHANGE, SYNC_CHECK).
     */
    @MessageMapping("/room/{roomCode}/sync")
    public void handlePlaybackSync(
            @DestinationVariable String roomCode,
            @Payload PlaybackSyncMessage message) {

        long now = System.currentTimeMillis();
        message.setServerTimestamp(now);
        message.setRoomCode(roomCode);

        // Update room state in database if state-altering action
        if (message.getAction() == PlaybackAction.PLAY) {
            watchRoomService.updatePlaybackState(roomCode, true, message.getCurrentPosition());
        } else if (message.getAction() == PlaybackAction.PAUSE) {
            watchRoomService.updatePlaybackState(roomCode, false, message.getCurrentPosition());
        } else if (message.getAction() == PlaybackAction.SEEK) {
            watchRoomService.updatePlaybackState(roomCode, null, message.getCurrentPosition());
        }

        messagingTemplate.convertAndSend("/topic/room/" + roomCode + "/sync", message);
    }

    /**
     * Relays peer-to-peer WebRTC video/audio signaling packets (OFFER, ANSWER, ICE_CANDIDATE, CALL_STATE, LEAVE_CALL).
     */
    @MessageMapping("/room/{roomCode}/webrtc")
    public void handleWebRtcSignaling(
            @DestinationVariable String roomCode,
            @Payload WebRtcSignalMessage message) {

        message.setRoomCode(roomCode);
        log.debug("WebRTC signal received for room {}: type={}, sender={}", roomCode, message.getType(), message.getSenderName());
        messagingTemplate.convertAndSend("/topic/room/" + roomCode + "/webrtc", message);
    }

    /**
     * Relays live chat messages.
     */
    @MessageMapping("/room/{roomCode}/chat")
    public void handleChatMessage(
            @DestinationVariable String roomCode,
            @Payload ChatMessageDto message) {

        message.setRoomCode(roomCode);
        messagingTemplate.convertAndSend("/topic/room/" + roomCode + "/chat", message);
    }

    /**
     * Relays user presence (joined / left room / camera connected).
     */
    @MessageMapping("/room/{roomCode}/presence")
    public void handlePresence(
            @DestinationVariable String roomCode,
            @Payload PresenceMessage message) {

        message.setRoomCode(roomCode);
        message.setTimestamp(System.currentTimeMillis());
        messagingTemplate.convertAndSend("/topic/room/" + roomCode + "/presence", message);
    }

    /**
     * Relays real-time chat typing indicator.
     */
    @MessageMapping("/room/{roomCode}/typing")
    public void handleTyping(
            @DestinationVariable String roomCode,
            @Payload TypingMessage message) {

        message.setRoomCode(roomCode);
        messagingTemplate.convertAndSend("/topic/room/" + roomCode + "/typing", message);
    }
}
