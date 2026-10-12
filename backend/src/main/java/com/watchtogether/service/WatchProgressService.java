package com.watchtogether.service;

import com.watchtogether.exception.ResourceNotFoundException;
import com.watchtogether.model.dto.SyncDtos.WatchProgressDto;
import com.watchtogether.model.dto.SyncDtos.WatchProgressRequest;
import com.watchtogether.model.entity.User;
import com.watchtogether.model.entity.Video;
import com.watchtogether.model.entity.WatchProgress;
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

    public WatchProgressService(WatchProgressRepository watchProgressRepository, VideoRepository videoRepository) {
        this.watchProgressRepository = watchProgressRepository;
        this.videoRepository = videoRepository;
    }

    @Transactional
    public WatchProgressDto saveProgress(WatchProgressRequest request, User user) {
        Video video = videoRepository.findById(request.getVideoId())
                .orElseThrow(() -> new ResourceNotFoundException("Video", "id", request.getVideoId()));

        WatchProgress progress = watchProgressRepository.findByUserAndVideo(user, video)
                .orElse(WatchProgress.builder()
                        .user(user)
                        .video(video)
                        .progressSeconds(0.0)
                        .completed(false)
                        .build());

        double currentProgress = request.getProgressSeconds() != null ? request.getProgressSeconds() : 0.0;
        progress.setProgressSeconds(currentProgress);

        boolean isCompleted = Boolean.TRUE.equals(request.getCompleted());
        if (!isCompleted && video.getDurationSeconds() != null && video.getDurationSeconds() > 0) {
            double ratio = currentProgress / video.getDurationSeconds();
            if (ratio >= 0.92) {
                isCompleted = true;
            }
        }
        progress.setCompleted(isCompleted);

        progress = watchProgressRepository.save(progress);
        return toWatchProgressDto(progress);
    }

    @Transactional(readOnly = true)
    public List<WatchProgressDto> getContinueWatching(User user) {
        List<WatchProgress> list = watchProgressRepository.findByUserAndCompletedFalseOrderByLastWatchedAtDesc(user);
        return list.stream()
                .map(this::toWatchProgressDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public WatchProgressDto getProgressForVideo(Long videoId, User user) {
        Video video = videoRepository.findById(videoId)
                .orElseThrow(() -> new ResourceNotFoundException("Video", "id", videoId));

        return watchProgressRepository.findByUserAndVideo(user, video)
                .map(this::toWatchProgressDto)
                .orElse(null);
    }

    public WatchProgressDto toWatchProgressDto(WatchProgress progress) {
        if (progress == null) return null;

        Video video = progress.getVideo();
        double duration = video.getDurationSeconds() != null ? video.getDurationSeconds() : 0.0;
        double current = progress.getProgressSeconds() != null ? progress.getProgressSeconds() : 0.0;
        double percent = duration > 0 ? Math.min(100.0, (current / duration) * 100.0) : 0.0;

        return WatchProgressDto.builder()
                .id(progress.getId())
                .videoId(video.getId())
                .videoTitle(video.getTitle())
                .videoThumbnailUrl(video.getThumbnailUrl())
                .durationSeconds(duration)
                .progressSeconds(current)
                .percentComplete(percent)
                .completed(progress.getCompleted())
                .lastWatchedAt(progress.getLastWatchedAt())
                .build();
    }
}
