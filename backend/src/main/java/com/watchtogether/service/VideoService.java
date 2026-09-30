package com.watchtogether.service;

import com.watchtogether.exception.AppException;
import com.watchtogether.exception.ResourceNotFoundException;
import com.watchtogether.model.dto.VideoDtos.*;
import com.watchtogether.model.entity.User;
import com.watchtogether.model.entity.Video;
import com.watchtogether.model.entity.VideoJob;
import com.watchtogether.model.entity.WatchProgress;
import com.watchtogether.model.enums.JobStatus;
import com.watchtogether.model.enums.VideoStatus;
import com.watchtogether.repository.VideoJobRepository;
import com.watchtogether.repository.VideoRepository;
import com.watchtogether.repository.WatchProgressRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Service
public class VideoService {

    private static final Logger log = LoggerFactory.getLogger(VideoService.class);

    private final VideoRepository videoRepository;
    private final VideoJobRepository videoJobRepository;
    private final WatchProgressRepository watchProgressRepository;
    private final StorageService storageService;
    private final VideoJobProcessor videoJobProcessor;
    private final AuthService authService;

    private final Map<String, Path> uploadChunksTracker = new ConcurrentHashMap<>();

    public VideoService(VideoRepository videoRepository, VideoJobRepository videoJobRepository, WatchProgressRepository watchProgressRepository, StorageService storageService, VideoJobProcessor videoJobProcessor, AuthService authService) {
        this.videoRepository = videoRepository;
        this.videoJobRepository = videoJobRepository;
        this.watchProgressRepository = watchProgressRepository;
        this.storageService = storageService;
        this.videoJobProcessor = videoJobProcessor;
        this.authService = authService;
    }

    @Transactional
    public VideoResponse uploadVideoDirect(User uploader, MultipartFile file, String title, String description, String genres) throws IOException {
        if (file.isEmpty()) {
            throw new AppException("Upload file cannot be empty.");
        }

        String originalFilename = file.getOriginalFilename();
        String fileExt = originalFilename != null && originalFilename.contains(".")
                ? originalFilename.substring(originalFilename.lastIndexOf("."))
                : ".mp4";

        String rawStorageKey = "raw/" + UUID.randomUUID() + fileExt;

        storageService.uploadFile(rawStorageKey, file.getInputStream(), file.getSize(), file.getContentType());

        Video video = Video.builder()
                .title(title != null && !title.isBlank() ? title.trim() : (originalFilename != null ? originalFilename : "Untitled Video"))
                .description(description)
                .genres(genres != null && !genres.isBlank() ? genres : "General")
                .originalFilename(originalFilename)
                .rawStorageKey(rawStorageKey)
                .fileSizeBytes(file.getSize())
                .status(VideoStatus.PENDING)
                .uploader(uploader)
                .build();

        video = videoRepository.save(video);

        VideoJob job = VideoJob.builder()
                .video(video)
                .status(JobStatus.QUEUED)
                .progressPercent(0)
                .build();

        job = videoJobRepository.save(job);

        videoJobProcessor.processVideoJobAsync(job.getId());

        return toVideoResponse(video, null);
    }

    public VideoUploadChunkResponse handleChunkUpload(
            User uploader,
            String uploadId,
            int chunkIndex,
            int totalChunks,
            MultipartFile chunk,
            String title,
            String description,
            String genres,
            String originalFilename
    ) throws IOException {
        if (uploadId == null || uploadId.isBlank()) {
            uploadId = UUID.randomUUID().toString();
        }

        Path tempChunkFile = uploadChunksTracker.computeIfAbsent(uploadId, k -> {
            try {
                return Files.createTempFile("chunk_upload_" + k, ".tmp");
            } catch (IOException e) {
                throw new RuntimeException("Failed to create temp chunk file", e);
            }
        });

        Files.write(tempChunkFile, chunk.getBytes(), StandardOpenOption.CREATE, StandardOpenOption.APPEND);

        boolean isComplete = (chunkIndex + 1) >= totalChunks;
        VideoResponse videoResponse = null;

        if (isComplete) {
            try {
                String fileExt = originalFilename != null && originalFilename.contains(".")
                        ? originalFilename.substring(originalFilename.lastIndexOf("."))
                        : ".mp4";

                String rawStorageKey = "raw/" + uploadId + fileExt;
                long totalSize = Files.size(tempChunkFile);

                try (InputStream is = Files.newInputStream(tempChunkFile)) {
                    storageService.uploadFile(rawStorageKey, is, totalSize, "video/mp4");
                }

                Video video = Video.builder()
                        .title(title != null && !title.isBlank() ? title.trim() : (originalFilename != null ? originalFilename : "Uploaded Video"))
                        .description(description)
                        .genres(genres != null && !genres.isBlank() ? genres : "General")
                        .originalFilename(originalFilename)
                        .rawStorageKey(rawStorageKey)
                        .fileSizeBytes(totalSize)
                        .status(VideoStatus.PENDING)
                        .uploader(uploader)
                        .build();

                video = videoRepository.save(video);

                VideoJob job = VideoJob.builder()
                        .video(video)
                        .status(JobStatus.QUEUED)
                        .progressPercent(0)
                        .build();

                job = videoJobRepository.save(job);

                videoJobProcessor.processVideoJobAsync(job.getId());

                videoResponse = toVideoResponse(video, null);
            } finally {
                uploadChunksTracker.remove(uploadId);
                Files.deleteIfExists(tempChunkFile);
            }
        }

        return VideoUploadChunkResponse.builder()
                .uploadId(uploadId)
                .chunkIndex(chunkIndex)
                .totalChunks(totalChunks)
                .isComplete(isComplete)
                .video(videoResponse)
                .build();
    }

    @Transactional(readOnly = true)
    public List<VideoResponse> getAllReadyVideos(User currentUser) {
        List<Video> videos = videoRepository.findByStatusOrderByCreatedAtDesc(VideoStatus.READY);
        return videos.stream()
                .map(v -> toVideoResponse(v, currentUser))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<VideoResponse> searchVideos(String query, Pageable pageable, User currentUser) {
        Page<Video> page;
        if (query == null || query.isBlank()) {
            page = videoRepository.findAll(pageable);
        } else {
            page = videoRepository.searchVideos(VideoStatus.READY, query.trim(), pageable);
        }
        return page.map(v -> toVideoResponse(v, currentUser));
    }

    @Transactional(readOnly = true)
    public List<VideoResponse> getVideosByGenre(String genre, User currentUser) {
        List<Video> videos = videoRepository.findByGenre(VideoStatus.READY, genre);
        return videos.stream()
                .map(v -> toVideoResponse(v, currentUser))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<VideoResponse> getMyUploads(User uploader) {
        List<Video> videos = videoRepository.findByUploaderOrderByCreatedAtDesc(uploader);
        return videos.stream()
                .map(v -> toVideoResponse(v, uploader))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public VideoResponse getVideoById(Long id, User currentUser) {
        Video video = videoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Video", "id", id));
        return toVideoResponse(video, currentUser);
    }

    @Transactional
    public void deleteVideo(Long id, User currentUser) {
        Video video = videoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Video", "id", id));

        if (video.getUploader() != null && !video.getUploader().getId().equals(currentUser.getId())) {
            throw new AppException("You do not have permission to delete this video.");
        }

        if (video.getRawStorageKey() != null) {
            storageService.deleteFile(video.getRawStorageKey());
        }
        if (video.getHlsMasterKey() != null) {
            String dirPrefix = "videos/" + video.getId();
            storageService.deleteDirectory(dirPrefix);
        }

        videoRepository.delete(video);
        log.info("Video {} deleted by user {}", id, currentUser.getUsername());
    }

    public VideoResponse toVideoResponse(Video video, User currentUser) {
        if (video == null) return null;

        Integer progress = null;
        String errorMessage = null;
        Optional<VideoJob> latestJob = videoJobRepository.findFirstByVideoOrderByCreatedAtDesc(video);
        if (latestJob.isPresent()) {
            progress = latestJob.get().getProgressPercent();
            errorMessage = latestJob.get().getErrorMessage();
        }

        Double resumePos = null;
        if (currentUser != null) {
            Optional<WatchProgress> wp = watchProgressRepository.findByUserAndVideo(currentUser, video);
            if (wp.isPresent()) {
                resumePos = wp.get().getProgressSeconds();
            }
        }

        return VideoResponse.builder()
                .id(video.getId())
                .title(video.getTitle())
                .description(video.getDescription())
                .genres(video.getGenres())
                .durationSeconds(video.getDurationSeconds())
                .originalFilename(video.getOriginalFilename())
                .hlsMasterUrl(video.getHlsMasterUrl())
                .thumbnailUrl(video.getThumbnailUrl())
                .status(video.getStatus())
                .fileSizeBytes(video.getFileSizeBytes())
                .resolutions(video.getResolutions())
                .uploader(authService.toUserDto(video.getUploader()))
                .processingProgress(progress)
                .errorMessage(errorMessage)
                .userResumePosition(resumePos)
                .createdAt(video.getCreatedAt())
                .build();
    }
}
