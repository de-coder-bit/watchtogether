package com.watchtogether.controller;

import com.watchtogether.model.dto.PartnerDtos.*;
import com.watchtogether.model.entity.User;
import com.watchtogether.service.PartnerService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/partner")
public class PartnerController {

    private final PartnerService partnerService;

    public PartnerController(PartnerService partnerService) {
        this.partnerService = partnerService;
    }

    @PostMapping("/invite")
    public ResponseEntity<PartnerInviteResponse> createInvite(@AuthenticationPrincipal User currentUser) {
        PartnerInviteResponse response = partnerService.createOrGetActiveInvite(currentUser);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/pair")
    public ResponseEntity<PartnerStatusResponse> pairPartner(
            @AuthenticationPrincipal User currentUser,
            @Valid @RequestBody PairRequest request) {
        PartnerStatusResponse response = partnerService.pairPartner(currentUser, request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/unpair")
    public ResponseEntity<PartnerStatusResponse> unpairPartner(@AuthenticationPrincipal User currentUser) {
        PartnerStatusResponse response = partnerService.unpairPartner(currentUser);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/status")
    public ResponseEntity<PartnerStatusResponse> getPartnerStatus(@AuthenticationPrincipal User currentUser) {
        PartnerStatusResponse response = partnerService.getPartnerStatus(currentUser);
        return ResponseEntity.ok(response);
    }
}
