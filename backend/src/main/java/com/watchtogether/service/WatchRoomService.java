package com.watchtogether.service;

import com.watchtogether.exception.ResourceNotFoundException;
import com.watchtogether.model.dto.ChatDtos.*;
import com.watchtogether.model.dto.WatchRoomDtos.*;
import com.watchtogether.model.entity.ChatMessage;
import com.watchtogether.model.entity.User;
import com.watchtogether.model.entity.Video;
import com.watchtogether.model.entity.WatchRoom;
import com.watchtogether.repository.ChatMessageRepository;
import com.watchtogether.repository.UserRepository;
import com.watchtogether.repository.VideoRepository;
import com.watchtogether.repository.WatchRoomRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class WatchRoomService {

    private static final Logger log = LoggerFactory.getLogger(WatchRoomService.class);

    private final WatchRoomRepository roomRepository;
    private final VideoRepository videoRepository;
    private final UserRepository userRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final AuthService authService;
    private final VideoService videoService;

    private static final String ROOM_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private static final SecureRandom RANDOM = new SecureRandom();

    public WatchRoomService(WatchRoomRepository roomRepository, VideoRepository videoRepository, UserRepository userRepository, ChatMessageRepository chatMessageRepository, AuthService authService, VideoService videoService) {
        this.roomRepository = roomRepository;
        this.videoRepository = videoRepository;
        this.userRepository = userRepository;
        this.chatMessageRepository = chatMessageRepository;
        this.authService = authService;
        this.videoService = videoService;
    }

    @Transactional
    public RoomResponse createRoom(User host, CreateRoomRequest request) {
        User freshHost = userRepository.findById(host.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", host.getId()));

        Video video = videoRepository.findById(request.getVideoId())
                .orElseThrow(() -> new ResourceNotFoundException("Video", "id", request.getVideoId()));

        String roomCode = generateRoomCode();
        String title = request.getTitle() != null && !request.getTitle().isBlank()
                ? request.getTitle()
                : "Watch " + video.getTitle();

        WatchRoom room = WatchRoom.builder()
                .roomCode(roomCode)
                .title(title)
                .host(freshHost)
                .partner(freshHost.getPartner())
                .currentVideo(video)
                .isPlaying(false)
                .currentPositionSeconds(0.0)
                .lastActionTimestamp(System.currentTimeMillis())
                .build();

        room = roomRepository.save(room);
        log.info("WatchRoom {} created by host {} for video '{}'", roomCode, freshHost.getUsername(), video.getTitle());

        return toRoomResponse(room, freshHost);
    }

    @Transactional(readOnly = true)
    public RoomResponse getRoomByCode(String roomCode, User currentUser) {
        WatchRoom room = roomRepository.findByRoomCode(roomCode)
                .orElseThrow(() -> new ResourceNotFoundException("WatchRoom", "roomCode", roomCode));
        return toRoomResponse(room, currentUser);
    }

    @Transactional
    public void updatePlaybackState(String roomCode, Double position, Boolean isPlaying) {
        WatchRoom room = roomRepository.findByRoomCode(roomCode).orElse(null);
        if (room != null) {
            if (position != null) {
                room.setCurrentPositionSeconds(position);
            }
            if (isPlaying != null) {
                room.setIsPlaying(isPlaying);
            }
            room.setLastActionTimestamp(System.currentTimeMillis());
            roomRepository.save(room);
        }
    }

    @Transactional
    public ChatMessageDto saveChatMessage(String roomCode, User sender, String content) {
        WatchRoom room = roomRepository.findByRoomCode(roomCode)
                .orElseThrow(() -> new ResourceNotFoundException("WatchRoom", "roomCode", roomCode));

        User freshSender = userRepository.findById(sender.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", sender.getId()));

        ChatMessage message = ChatMessage.builder()
                .room(room)
                .sender(freshSender)
                .content(content.trim())
                .build();

        message = chatMessageRepository.save(message);

        return ChatMessageDto.builder()
                .id(message.getId())
                .roomCode(roomCode)
                .senderId(freshSender.getId())
                .senderName(freshSender.getUsername())
                .senderAvatar(freshSender.getAvatarUrl())
                .content(message.getContent())
                .timestamp(message.getCreatedAt())
                .build();
    }

    @Transactional(readOnly = true)
    public List<ChatMessageDto> getRoomMessages(String roomCode) {
        WatchRoom room = roomRepository.findByRoomCode(roomCode)
                .orElseThrow(() -> new ResourceNotFoundException("WatchRoom", "roomCode", roomCode));

        List<ChatMessage> messages = chatMessageRepository.findByRoomOrderByCreatedAtAsc(room);
        return messages.stream()
                .map(m -> ChatMessageDto.builder()
                        .id(m.getId())
                        .roomCode(roomCode)
                        .senderId(m.getSender().getId())
                        .senderName(m.getSender().getUsername())
                        .senderAvatar(m.getSender().getAvatarUrl())
                        .content(m.getContent())
                        .timestamp(m.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }

    public RoomResponse toRoomResponse(WatchRoom room, User currentUser) {
        return RoomResponse.builder()
                .id(room.getId())
                .roomCode(room.getRoomCode())
                .title(room.getTitle())
                .host(authService.toUserDto(room.getHost()))
                .partner(authService.toUserDto(room.getPartner()))
                .video(videoService.toVideoResponse(room.getCurrentVideo(), currentUser))
                .isPlaying(room.getIsPlaying())
                .currentPositionSeconds(room.getCurrentPositionSeconds())
                .lastActionTimestamp(room.getLastActionTimestamp())
                .createdAt(room.getCreatedAt())
                .build();
    }

    private String generateRoomCode() {
        StringBuilder sb = new StringBuilder("ROOM-");
        for (int i = 0; i < 6; i++) {
            sb.append(ROOM_CHARS.charAt(RANDOM.nextInt(ROOM_CHARS.length())));
        }
        return sb.toString();
    }
}
