package com.watchtogether.service;

import com.watchtogether.exception.ResourceNotFoundException;
import com.watchtogether.model.dto.SyncDtos.*;
import com.watchtogether.model.entity.User;
import com.watchtogether.model.entity.Video;
import com.watchtogether.model.entity.WatchProgress;
import com.watchtogether.repository.UserRepository;
import com.watchtogether.repository.VideoRepository;
import com.watchtogether.repository.WatchProgressRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class WatchProgressService {

    private static final Logger log = LoggerFactory.getLogger(WatchProgressService.class);

    private final WatchProgressRepository watchProgressRepository;
    private final VideoRepository videoRepository;
    private final UserRepository userRepository;

    public WatchProgressService(WatchProgressRepository watchProgressRepository, VideoRepository videoRepository, UserRepository userRepository) {
        this.watchProgressRepository = watchProgressRepository;
        this.videoRepository = videoRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public WatchProgressDto saveProgress(User user, WatchProgressRequest request) {
        User freshUser = userRepository.findById(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", user.getId()));

        Video video = videoRepository.findById(request.getVideoId())
                .orElseThrow(() -> new ResourceNotFoundException("Video", "id", request.getVideoId()));

        WatchProgress progress = watchProgressRepository.findByUserAndVideo(freshUser, video)
                .orElse(WatchProgress.builder()
                        .user(freshUser)
                        .video(video)
                        .build());

        double currentSeconds = request.getProgressSeconds() != null ? request.getProgressSeconds() : 0.0;
        progress.setProgressSeconds(currentSeconds);

        double duration = video.getDurationSeconds() != null && video.getDurationSeconds() > 0
                ? video.getDurationSeconds()
                : 100.0;

        boolean isCompleted = request.getCompleted() != null
                ? request.getCompleted()
                : (currentSeconds / duration >= 0.95);

        progress.setCompleted(isCompleted);
        progress = watchProgressRepository.save(progress);

        return toDto(progress);
    }

    @Transactional(readOnly = true)
    public List<WatchProgressDto> getContinueWatching(User user) {
        User freshUser = userRepository.findById(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", user.getId()));

        List<WatchProgress> list = watchProgressRepository.findByUserAndCompletedFalseOrderByLastWatchedAtDesc(freshUser);
        return list.stream()
                .filter(wp -> wp.getProgressSeconds() > 10.0)
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    private WatchProgressDto toDto(WatchProgress wp) {
        Video v = wp.getVideo();
        double duration = v.getDurationSeconds() != null && v.getDurationSeconds() > 0 ? v.getDurationSeconds() : 1.0;
        double percent = Math.min(100.0, (wp.getProgressSeconds() / duration) * 100.0);

        return WatchProgressDto.builder()
                .id(wp.getId())
                .videoId(v.getId())
                .videoTitle(v.getTitle())
                .videoThumbnailUrl(v.getThumbnailUrl())
                .durationSeconds(v.getDurationSeconds())
                .progressSeconds(wp.getProgressSeconds())
                .percentComplete(Math.round(percent * 10.0) / 10.0)
                .completed(wp.getCompleted())
                .lastWatchedAt(wp.getLastWatchedAt())
                .build();
    }
}
