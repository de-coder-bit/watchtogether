package com.watchtogether.controller;

import com.watchtogether.model.dto.VideoDtos.*;
import com.watchtogether.model.entity.User;
import com.watchtogether.service.VideoService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/videos")
public class VideoController {

    private final VideoService videoService;

    public VideoController(VideoService videoService) {
        this.videoService = videoService;
    }

    @GetMapping
    public ResponseEntity<List<VideoResponse>> getAllVideos(@AuthenticationPrincipal User currentUser) {
        List<VideoResponse> videos = videoService.getAllReadyVideos(currentUser);
        return ResponseEntity.ok(videos);
    }

    @GetMapping("/search")
    public ResponseEntity<Page<VideoResponse>> searchVideos(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String genre,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @AuthenticationPrincipal User currentUser) {
        Page<VideoResponse> result = videoService.searchVideos(query, genre, page, size, currentUser);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{id}")
    public ResponseEntity<VideoResponse> getVideoById(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser) {
        VideoResponse video = videoService.getVideoById(id, currentUser);
        return ResponseEntity.ok(video);
    }

    @GetMapping("/my")
    public ResponseEntity<List<VideoResponse>> getMyVideos(@AuthenticationPrincipal User currentUser) {
        List<VideoResponse> videos = videoService.getMyVideos(currentUser);
        return ResponseEntity.ok(videos);
    }

    @PostMapping("/upload-chunk")
    public ResponseEntity<VideoUploadChunkResponse> uploadChunk(
            @RequestParam("chunk") MultipartFile chunk,
            @RequestParam("chunkIndex") Integer chunkIndex,
            @RequestParam("totalChunks") Integer totalChunks,
            @RequestParam(value = "uploadId", required = false) String uploadId,
            @RequestParam(value = "title", required = false) String title,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "genres", required = false) String genres,
            @AuthenticationPrincipal User currentUser) {

        VideoUploadChunkResponse response = videoService.uploadChunk(
                chunk, chunkIndex, totalChunks, uploadId, title, description, genres, currentUser
        );
        return ResponseEntity.status(response.isComplete() ? HttpStatus.CREATED : HttpStatus.ACCEPTED).body(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<VideoResponse> updateVideo(
            @PathVariable Long id,
            @Valid @RequestBody VideoMetadataRequest request,
            @AuthenticationPrincipal User currentUser) {
        VideoResponse response = videoService.updateVideoMetadata(id, request, currentUser);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteVideo(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser) {
        videoService.deleteVideo(id, currentUser);
        return ResponseEntity.noContent().build();
    }
}
