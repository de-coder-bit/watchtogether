package com.watchtogether.service;

import com.watchtogether.exception.AppException;
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
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class WatchRoomService {

    private static final Logger log = LoggerFactory.getLogger(WatchRoomService.class);
    private static final String ROOM_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private static final SecureRandom RANDOM = new SecureRandom();

    private final WatchRoomRepository watchRoomRepository;
    private final VideoRepository videoRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final UserRepository userRepository;
    private final AuthService authService;
    private final VideoService videoService;

    public WatchRoomService(WatchRoomRepository watchRoomRepository,
                            VideoRepository videoRepository,
                            ChatMessageRepository chatMessageRepository,
                            UserRepository userRepository,
                            AuthService authService,
                            VideoService videoService) {
        this.watchRoomRepository = watchRoomRepository;
        this.videoRepository = videoRepository;
        this.chatMessageRepository = chatMessageRepository;
        this.userRepository = userRepository;
        this.authService = authService;
        this.videoService = videoService;
    }

    @Transactional
    public RoomResponse createRoom(CreateRoomRequest request, User host) {
        Video video = videoRepository.findById(request.getVideoId())
                .orElseThrow(() -> new ResourceNotFoundException("Video", "id", request.getVideoId()));

        User freshHost = userRepository.findById(host.getId())
                .orElseThrow(() -> new AppException("Host user not found", HttpStatus.NOT_FOUND));

        String roomCode = generateRoomCode();
        String title = request.getTitle();
        if (title == null || title.isBlank()) {
            title = "Watch: " + video.getTitle();
        }

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

        room = watchRoomRepository.save(room);
        log.info("Created watch room {} with video '{}' for host {}", roomCode, video.getTitle(), freshHost.getEmail());

        return toRoomResponse(room, freshHost);
    }

    @Transactional(readOnly = true)
    public RoomResponse getRoomByCode(String roomCode, User currentUser) {
        WatchRoom room = watchRoomRepository.findByRoomCode(roomCode)
                .orElseThrow(() -> new ResourceNotFoundException("WatchRoom", "roomCode", roomCode));
        return toRoomResponse(room, currentUser);
    }

    @Transactional
    public RoomResponse joinRoom(String roomCode, User user) {
        WatchRoom room = watchRoomRepository.findByRoomCode(roomCode)
                .orElseThrow(() -> new ResourceNotFoundException("WatchRoom", "roomCode", roomCode));

        User freshUser = userRepository.findById(user.getId())
                .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));

        if (room.getPartner() == null && !room.getHost().getId().equals(freshUser.getId())) {
            room.setPartner(freshUser);
            room = watchRoomRepository.save(room);
        }

        return toRoomResponse(room, freshUser);
    }

    @Transactional
    public void updatePlaybackState(String roomCode, Boolean isPlaying, Double position) {
        WatchRoom room = watchRoomRepository.findByRoomCode(roomCode)
                .orElseThrow(() -> new ResourceNotFoundException("WatchRoom", "roomCode", roomCode));

        if (isPlaying != null) {
            room.setIsPlaying(isPlaying);
        }
        if (position != null) {
            room.setCurrentPositionSeconds(position);
        }
        room.setLastActionTimestamp(System.currentTimeMillis());
        watchRoomRepository.save(room);
    }

    @Transactional(readOnly = true)
    public List<RoomResponse> getUserRooms(User user) {
        List<WatchRoom> rooms = watchRoomRepository.findRoomsByUser(user);
        return rooms.stream()
                .map(r -> toRoomResponse(r, user))
                .collect(Collectors.toList());
    }

    @Transactional
    public ChatMessageDto saveChatMessage(String roomCode, ChatMessageRequest request, User sender) {
        WatchRoom room = watchRoomRepository.findByRoomCode(roomCode)
                .orElseThrow(() -> new ResourceNotFoundException("WatchRoom", "roomCode", roomCode));

        ChatMessage message = ChatMessage.builder()
                .room(room)
                .sender(sender)
                .content(request.getContent().trim())
                .build();

        message = chatMessageRepository.save(message);

        return toChatMessageDto(message);
    }

    @Transactional(readOnly = true)
    public List<ChatMessageDto> getChatHistory(String roomCode, int limit) {
        WatchRoom room = watchRoomRepository.findByRoomCode(roomCode)
                .orElseThrow(() -> new ResourceNotFoundException("WatchRoom", "roomCode", roomCode));

        List<ChatMessage> messages = chatMessageRepository.findByRoomOrderByCreatedAtDesc(room, PageRequest.of(0, limit));
        return messages.stream()
                .sorted((a, b) -> a.getCreatedAt().compareTo(b.getCreatedAt()))
                .map(this::toChatMessageDto)
                .collect(Collectors.toList());
    }

    public RoomResponse toRoomResponse(WatchRoom room, User currentUser) {
        if (room == null) return null;

        return RoomResponse.builder()
                .id(room.getId())
                .roomCode(room.getRoomCode())
                .title(room.getTitle())
                .host(authService.toUserDto(room.getHost()))
                .partner(room.getPartner() != null ? authService.toUserDto(room.getPartner()) : null)
                .video(videoService.toVideoResponse(room.getCurrentVideo(), currentUser))
                .isPlaying(room.getIsPlaying())
                .currentPositionSeconds(room.getCurrentPositionSeconds())
                .lastActionTimestamp(room.getLastActionTimestamp())
                .createdAt(room.getCreatedAt())
                .build();
    }

    public ChatMessageDto toChatMessageDto(ChatMessage msg) {
        if (msg == null) return null;

        return ChatMessageDto.builder()
                .id(msg.getId())
                .roomCode(msg.getRoom().getRoomCode())
                .senderId(msg.getSender().getId())
                .senderName(msg.getSender().getUsername())
                .senderAvatar(msg.getSender().getAvatarUrl())
                .content(msg.getContent())
                .timestamp(msg.getCreatedAt() != null ? msg.getCreatedAt() : LocalDateTime.now())
                .build();
    }

    private String generateRoomCode() {
        StringBuilder sb = new StringBuilder(6);
        for (int i = 0; i < 6; i++) {
            sb.append(ROOM_CHARS.charAt(RANDOM.nextInt(ROOM_CHARS.length())));
        }
        return sb.toString();
    }
}
