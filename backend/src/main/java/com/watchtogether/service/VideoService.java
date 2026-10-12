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
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.*;
import java.nio.file.*;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class VideoService {

    private static final Logger log = LoggerFactory.getLogger(VideoService.class);

    private final VideoRepository videoRepository;
    private final VideoJobRepository videoJobRepository;
    private final WatchProgressRepository watchProgressRepository;
    private final VideoJobProcessor videoJobProcessor;
    private final AuthService authService;
    private final StorageService storageService;

    public VideoService(VideoRepository videoRepository,
                        VideoJobRepository videoJobRepository,
                        WatchProgressRepository watchProgressRepository,
                        VideoJobProcessor videoJobProcessor,
                        AuthService authService,
                        StorageService storageService) {
        this.videoRepository = videoRepository;
        this.videoJobRepository = videoJobRepository;
        this.watchProgressRepository = watchProgressRepository;
        this.videoJobProcessor = videoJobProcessor;
        this.authService = authService;
        this.storageService = storageService;
    }

    @Transactional(readOnly = true)
    public List<VideoResponse> getAllReadyVideos(User currentUser) {
        List<Video> videos = videoRepository.findByStatusOrderByCreatedAtDesc(VideoStatus.READY);
        return videos.stream()
                .map(v -> toVideoResponse(v, currentUser))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<VideoResponse> searchVideos(String query, String genre, int page, int size, User currentUser) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Video> videoPage;
        if (query != null && !query.isBlank()) {
            videoPage = videoRepository.searchVideos(VideoStatus.READY, query.trim(), pageable);
        } else {
            videoPage = videoRepository.findAll(pageable);
        }
        return videoPage.map(v -> toVideoResponse(v, currentUser));
    }

    @Transactional(readOnly = true)
    public VideoResponse getVideoById(Long id, User currentUser) {
        Video video = videoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Video", "id", id));
        return toVideoResponse(video, currentUser);
    }

    @Transactional(readOnly = true)
    public List<VideoResponse> getMyVideos(User currentUser) {
        List<Video> videos = videoRepository.findByUploaderOrderByCreatedAtDesc(currentUser);
        return videos.stream()
                .map(v -> toVideoResponse(v, currentUser))
                .collect(Collectors.toList());
    }

    @Transactional
    public VideoUploadChunkResponse uploadChunk(
            MultipartFile chunk,
            Integer chunkIndex,
            Integer totalChunks,
            String uploadId,
            String title,
            String description,
            String genres,
            User uploader) {

        try {
            if (uploadId == null || uploadId.isBlank()) {
                uploadId = UUID.randomUUID().toString();
            }

            Path tempDir = Paths.get(System.getProperty("java.io.tmpdir"), "watchtogether-uploads", uploadId);
            Files.createDirectories(tempDir);

            Path chunkFile = tempDir.resolve("chunk-" + String.format("%05d", chunkIndex));
            Files.copy(chunk.getInputStream(), chunkFile, StandardCopyOption.REPLACE_EXISTING);

            log.info("Saved upload chunk {}/{} for uploadId: {}", chunkIndex + 1, totalChunks, uploadId);

            boolean isComplete = (chunkIndex + 1) >= totalChunks;

            if (isComplete) {
                // Assemble chunks into final raw file
                String originalFilename = chunk.getOriginalFilename() != null ? chunk.getOriginalFilename() : "video.mp4";
                Path assembledFile = tempDir.resolve("full-" + originalFilename);

                try (OutputStream out = new BufferedOutputStream(Files.newOutputStream(assembledFile))) {
                    for (int i = 0; i < totalChunks; i++) {
                        Path part = tempDir.resolve("chunk-" + String.format("%05d", i));
                        if (!Files.exists(part)) {
                            throw new AppException("Missing chunk " + i + " during assembly", HttpStatus.BAD_REQUEST);
                        }
                        Files.copy(part, out);
                    }
                }

                long fileSizeBytes = Files.size(assembledFile);

                // Upload raw file to storage
                String rawKey = "raw/" + uploadId + "/" + originalFilename;
                storageService.uploadFile(rawKey, assembledFile.toFile(), "video/mp4");

                // Save Video entity in database
                Video video = Video.builder()
                        .title(title != null && !title.isBlank() ? title.trim() : originalFilename)
                        .description(description)
                        .genres(genres)
                        .originalFilename(originalFilename)
                        .rawStorageKey(rawKey)
                        .status(VideoStatus.PROCESSING)
                        .fileSizeBytes(fileSizeBytes)
                        .uploader(uploader)
                        .build();

                video = videoRepository.save(video);

                // Create processing job
                VideoJob job = VideoJob.builder()
                        .video(video)
                        .status(JobStatus.QUEUED)
                        .progressPercent(0)
                        .build();

                job = videoJobRepository.save(job);

                // Asynchronously trigger transcoding
                videoJobProcessor.processVideoJobAsync(job.getId());

                // Cleanup assembled temporary files
                try {
                    Files.deleteIfExists(assembledFile);
                    for (int i = 0; i < totalChunks; i++) {
                        Files.deleteIfExists(tempDir.resolve("chunk-" + String.format("%05d", i)));
                    }
                    Files.deleteIfExists(tempDir);
                } catch (Exception ex) {
                    log.warn("Could not clean up temp upload directory: {}", ex.getMessage());
                }

                return VideoUploadChunkResponse.builder()
                        .uploadId(uploadId)
                        .chunkIndex(chunkIndex)
                        .totalChunks(totalChunks)
                        .isComplete(true)
                        .video(toVideoResponse(video, uploader))
                        .build();
            } else {
                return VideoUploadChunkResponse.builder()
                        .uploadId(uploadId)
                        .chunkIndex(chunkIndex)
                        .totalChunks(totalChunks)
                        .isComplete(false)
                        .video(null)
                        .build();
            }

        } catch (IOException e) {
            log.error("Failed handling video chunk upload", e);
            throw new AppException("Failed to upload video chunk: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Transactional
    public VideoResponse updateVideoMetadata(Long videoId, VideoMetadataRequest request, User uploader) {
        Video video = videoRepository.findById(videoId)
                .orElseThrow(() -> new ResourceNotFoundException("Video", "id", videoId));

        if (!video.getUploader().getId().equals(uploader.getId())) {
            throw new AppException("You do not have permission to edit this video", HttpStatus.FORBIDDEN);
        }

        if (request.getTitle() != null && !request.getTitle().isBlank()) {
            video.setTitle(request.getTitle().trim());
        }
        if (request.getDescription() != null) {
            video.setDescription(request.getDescription().trim());
        }
        if (request.getGenres() != null) {
            video.setGenres(request.getGenres().trim());
        }

        video = videoRepository.save(video);
        return toVideoResponse(video, uploader);
    }

    @Transactional
    public void deleteVideo(Long videoId, User uploader) {
        Video video = videoRepository.findById(videoId)
                .orElseThrow(() -> new ResourceNotFoundException("Video", "id", videoId));

        if (!video.getUploader().getId().equals(uploader.getId())) {
            throw new AppException("You do not have permission to delete this video", HttpStatus.FORBIDDEN);
        }

        // Delete raw file and HLS directory from storage if possible
        if (video.getRawStorageKey() != null) {
            try {
                storageService.deleteFile(video.getRawStorageKey());
            } catch (Exception e) {
                log.warn("Could not delete raw video file: {}", e.getMessage());
            }
        }

        videoRepository.delete(video);
        log.info("Deleted video id: {} by user: {}", videoId, uploader.getEmail());
    }

    public VideoResponse toVideoResponse(Video video, User currentUser) {
        if (video == null) return null;

        Double userResumePosition = 0.0;
        if (currentUser != null) {
            Optional<WatchProgress> progress = watchProgressRepository.findByUserAndVideo(currentUser, video);
            if (progress.isPresent() && !Boolean.TRUE.equals(progress.get().getCompleted())) {
                userResumePosition = progress.get().getProgressSeconds();
            }
        }

        Integer progressPercent = null;
        String errorMessage = null;

        if (video.getStatus() == VideoStatus.PROCESSING || video.getStatus() == VideoStatus.PENDING) {
            Optional<VideoJob> job = videoJobRepository.findFirstByVideoOrderByCreatedAtDesc(video);
            if (job.isPresent()) {
                progressPercent = job.get().getProgressPercent();
                errorMessage = job.get().getErrorMessage();
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
                .uploader(video.getUploader() != null ? authService.toUserDto(video.getUploader()) : null)
                .processingProgress(progressPercent)
                .errorMessage(errorMessage)
                .userResumePosition(userResumePosition)
                .createdAt(video.getCreatedAt())
                .build();
    }
}
