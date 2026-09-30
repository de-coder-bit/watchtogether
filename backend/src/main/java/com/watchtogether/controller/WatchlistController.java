package com.watchtogether.controller;

import com.watchtogether.model.dto.SyncDtos.*;
import com.watchtogether.model.entity.User;
import com.watchtogether.service.WatchProgressService;
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
    public ResponseEntity<WatchProgressDto> updateProgress(
            @AuthenticationPrincipal User currentUser,
            @RequestBody WatchProgressRequest request
    ) {
        WatchProgressDto dto = watchProgressService.saveProgress(currentUser, request);
        return ResponseEntity.ok(dto);
    }

    @GetMapping("/continue-watching")
    public ResponseEntity<List<WatchProgressDto>> getContinueWatching(
            @AuthenticationPrincipal User currentUser
    ) {
        List<WatchProgressDto> list = watchProgressService.getContinueWatching(currentUser);
        return ResponseEntity.ok(list);
    }
}
