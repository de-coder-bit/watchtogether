package com.watchtogether.service;

import com.watchtogether.model.entity.Video;
import com.watchtogether.model.entity.VideoJob;
import com.watchtogether.model.enums.JobStatus;
import com.watchtogether.model.enums.VideoStatus;
import com.watchtogether.repository.VideoJobRepository;
import com.watchtogether.repository.VideoRepository;
import org.apache.commons.io.FileUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;

@Service
public class VideoJobProcessor {

    private static final Logger log = LoggerFactory.getLogger(VideoJobProcessor.class);

    private final VideoRepository videoRepository;
    private final VideoJobRepository videoJobRepository;
    private final TranscodingService transcodingService;
    private final StorageService storageService;

    public VideoJobProcessor(VideoRepository videoRepository, VideoJobRepository videoJobRepository, TranscodingService transcodingService, StorageService storageService) {
        this.videoRepository = videoRepository;
        this.videoJobRepository = videoJobRepository;
        this.transcodingService = transcodingService;
        this.storageService = storageService;
    }

    @Async("videoProcessingExecutor")
    public void processVideoJobAsync(Long jobId) {
        log.info("Starting background processing for VideoJob ID: {}", jobId);

        VideoJob job = videoJobRepository.findById(jobId).orElse(null);
        if (job == null) {
            log.error("VideoJob not found for ID: {}", jobId);
            return;
        }

        Video video = job.getVideo();
        job.setStatus(JobStatus.PROCESSING);
        job.setProgressPercent(10);
        videoJobRepository.save(job);

        video.setStatus(VideoStatus.PROCESSING);
        videoRepository.save(video);

        Path tempWorkDir = null;
        try {
            tempWorkDir = Files.createTempDirectory("watchtogether_transcode_" + video.getId() + "_");
            File inputRawFile = storageService.getLocalFile(video.getRawStorageKey());

            if (!inputRawFile.exists()) {
                throw new IllegalStateException("Raw video file not found at: " + inputRawFile.getAbsolutePath());
            }

            job.setProgressPercent(25);
            videoJobRepository.save(job);

            File hlsOutputDir = new File(tempWorkDir.toFile(), "hls");
            hlsOutputDir.mkdirs();

            TranscodingService.TranscodingResult result = transcodingService.processVideo(inputRawFile, hlsOutputDir);

            job.setProgressPercent(75);
            videoJobRepository.save(job);

            String hlsStoragePrefix = "videos/" + video.getId() + "/hls";
            storageService.uploadDirectory(hlsStoragePrefix, hlsOutputDir);

            String thumbnailStorageKey = "videos/" + video.getId() + "/thumbnail.jpg";
            String thumbnailUrl = storageService.uploadFile(thumbnailStorageKey, result.thumbnailFile(), "image/jpeg");

            String masterPlaylistKey = hlsStoragePrefix + "/master.m3u8";
            String masterPlaylistUrl = storageService.getFileUrl(masterPlaylistKey);

            video.setDurationSeconds(result.durationSeconds());
            video.setResolutions(result.resolutions());
            video.setHlsMasterKey(masterPlaylistKey);
            video.setHlsMasterUrl(masterPlaylistUrl);
            video.setThumbnailKey(thumbnailStorageKey);
            video.setThumbnailUrl(thumbnailUrl);
            video.setStatus(VideoStatus.READY);
            videoRepository.save(video);

            job.setStatus(JobStatus.COMPLETED);
            job.setProgressPercent(100);
            job.setErrorMessage(null);
            videoJobRepository.save(job);

            log.info("Successfully completed video transcoding job for Video ID: {} (HLS URL: {})", video.getId(), masterPlaylistUrl);

        } catch (Exception e) {
            log.error("Failed to transcode video ID {}: {}", video.getId(), e.getMessage(), e);

            video.setStatus(VideoStatus.FAILED);
            videoRepository.save(video);

            job.setStatus(JobStatus.FAILED);
            job.setErrorMessage(e.getMessage());
            videoJobRepository.save(job);

        } finally {
            if (tempWorkDir != null) {
                try {
                    FileUtils.deleteDirectory(tempWorkDir.toFile());
                } catch (Exception e) {
                    log.warn("Could not delete temp directory {}: {}", tempWorkDir, e.getMessage());
                }
            }
        }
    }
}
