package com.watchtogether.controller;

import com.watchtogether.model.dto.VideoDtos.*;
import com.watchtogether.model.entity.User;
import com.watchtogether.service.VideoService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/videos")
public class VideoController {

    private final VideoService videoService;

    public VideoController(VideoService videoService) {
        this.videoService = videoService;
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<VideoResponse> uploadVideo(
            @AuthenticationPrincipal User currentUser,
            @RequestParam("file") MultipartFile file,
            @RequestParam("title") String title,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "genres", required = false) String genres
    ) throws IOException {
        VideoResponse response = videoService.uploadVideoDirect(currentUser, file, title, description, genres);
        return ResponseEntity.ok(response);
    }

    @PostMapping(value = "/upload/chunk", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<VideoUploadChunkResponse> uploadChunk(
            @AuthenticationPrincipal User currentUser,
            @RequestParam("uploadId") String uploadId,
            @RequestParam("chunkIndex") int chunkIndex,
            @RequestParam("totalChunks") int totalChunks,
            @RequestParam("chunk") MultipartFile chunk,
            @RequestParam(value = "title", required = false) String title,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "genres", required = false) String genres,
            @RequestParam(value = "originalFilename", required = false) String originalFilename
    ) throws IOException {
        VideoUploadChunkResponse response = videoService.handleChunkUpload(
                currentUser, uploadId, chunkIndex, totalChunks, chunk, title, description, genres, originalFilename
        );
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<VideoResponse>> getAllReadyVideos(@AuthenticationPrincipal User currentUser) {
        List<VideoResponse> videos = videoService.getAllReadyVideos(currentUser);
        return ResponseEntity.ok(videos);
    }

    @GetMapping("/search")
    public ResponseEntity<Page<VideoResponse>> searchVideos(
            @RequestParam(value = "q", required = false) String query,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size,
            @AuthenticationPrincipal User currentUser
    ) {
        Page<VideoResponse> result = videoService.searchVideos(
                query,
                PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt")),
                currentUser
        );
        return ResponseEntity.ok(result);
    }

    @GetMapping("/genres/{genre}")
    public ResponseEntity<List<VideoResponse>> getVideosByGenre(
            @PathVariable("genre") String genre,
            @AuthenticationPrincipal User currentUser
    ) {
        List<VideoResponse> videos = videoService.getVideosByGenre(genre, currentUser);
        return ResponseEntity.ok(videos);
    }

    @GetMapping("/my-uploads")
    public ResponseEntity<List<VideoResponse>> getMyUploads(@AuthenticationPrincipal User currentUser) {
        List<VideoResponse> videos = videoService.getMyUploads(currentUser);
        return ResponseEntity.ok(videos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<VideoResponse> getVideoById(
            @PathVariable("id") Long id,
            @AuthenticationPrincipal User currentUser
    ) {
        VideoResponse video = videoService.getVideoById(id, currentUser);
        return ResponseEntity.ok(video);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteVideo(
            @PathVariable("id") Long id,
            @AuthenticationPrincipal User currentUser
    ) {
        videoService.deleteVideo(id, currentUser);
        return ResponseEntity.noContent().build();
    }
}
