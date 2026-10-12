package com.watchtogether.controller;

import com.watchtogether.model.dto.SyncDtos.WatchProgressDto;
import com.watchtogether.model.dto.SyncDtos.WatchProgressRequest;
import com.watchtogether.model.entity.User;
import com.watchtogether.service.WatchProgressService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/watchlist")
public class WatchlistController {

    private final WatchProgressService watchProgressService;

    public WatchlistController(WatchProgressService watchProgressService) {
        this.watchProgressService = watchProgressService;
    }

    @PostMapping("/progress")
    public ResponseEntity<WatchProgressDto> saveProgress(
            @Valid @RequestBody WatchProgressRequest request,
            @AuthenticationPrincipal User currentUser) {
        WatchProgressDto response = watchProgressService.saveProgress(request, currentUser);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/continue")
    public ResponseEntity<List<WatchProgressDto>> getContinueWatching(@AuthenticationPrincipal User currentUser) {
        List<WatchProgressDto> list = watchProgressService.getContinueWatching(currentUser);
        return ResponseEntity.ok(list);
    }

    @GetMapping("/video/{videoId}")
    public ResponseEntity<WatchProgressDto> getProgressForVideo(
            @PathVariable Long videoId,
            @AuthenticationPrincipal User currentUser) {
        WatchProgressDto progress = watchProgressService.getProgressForVideo(videoId, currentUser);
        return ResponseEntity.ok(progress);
    }
}
