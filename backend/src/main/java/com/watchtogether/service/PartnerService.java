package com.watchtogether.service;

import com.watchtogether.exception.AppException;
import com.watchtogether.model.dto.AuthDtos.PartnerDto;
import com.watchtogether.model.dto.PartnerDtos.*;
import com.watchtogether.model.entity.PartnerInvitation;
import com.watchtogether.model.entity.User;
import com.watchtogether.model.enums.InvitationStatus;
import com.watchtogether.repository.PartnerInvitationRepository;
import com.watchtogether.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class PartnerService {

    private static final Logger log = LoggerFactory.getLogger(PartnerService.class);
    private static final String CHARACTERS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private static final SecureRandom RANDOM = new SecureRandom();

    private final PartnerInvitationRepository invitationRepository;
    private final UserRepository userRepository;
    private final AuthService authService;

    @Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    public PartnerService(PartnerInvitationRepository invitationRepository, UserRepository userRepository, AuthService authService) {
        this.invitationRepository = invitationRepository;
        this.userRepository = userRepository;
        this.authService = authService;
    }

    @Transactional
    public PartnerInviteResponse createOrGetActiveInvite(User sender) {
        LocalDateTime now = LocalDateTime.now();
        Optional<PartnerInvitation> existingInvite = invitationRepository
                .findFirstBySenderAndStatusAndExpiresAtAfterOrderByCreatedAtDesc(sender, InvitationStatus.PENDING, now);

        if (existingInvite.isPresent()) {
            PartnerInvitation invite = existingInvite.get();
            return PartnerInviteResponse.builder()
                    .inviteCode(invite.getCode())
                    .expiresAt(invite.getExpiresAt())
                    .inviteUrl(frontendUrl + "/pair?code=" + invite.getCode())
                    .build();
        }

        String code = generateInviteCode();
        LocalDateTime expiresAt = now.plusDays(7);

        PartnerInvitation newInvite = PartnerInvitation.builder()
                .code(code)
                .sender(sender)
                .status(InvitationStatus.PENDING)
                .expiresAt(expiresAt)
                .build();

        newInvite = invitationRepository.save(newInvite);
        log.info("Created partner invite code: {} for user: {}", code, sender.getEmail());

        return PartnerInviteResponse.builder()
                .inviteCode(newInvite.getCode())
                .expiresAt(newInvite.getExpiresAt())
                .inviteUrl(frontendUrl + "/pair?code=" + newInvite.getCode())
                .build();
    }

    @Transactional
    public PartnerStatusResponse pairPartner(User currentUser, PairRequest request) {
        String code = request.getInviteCode().trim().toUpperCase();
        LocalDateTime now = LocalDateTime.now();

        PartnerInvitation invitation = invitationRepository.findByCodeAndStatus(code, InvitationStatus.PENDING)
                .orElseThrow(() -> new AppException("Invalid or expired invite code", HttpStatus.BAD_REQUEST));

        if (invitation.getExpiresAt().isBefore(now)) {
            invitation.setStatus(InvitationStatus.EXPIRED);
            invitationRepository.save(invitation);
            throw new AppException("This invite code has expired. Please request a new one.", HttpStatus.BAD_REQUEST);
        }

        User sender = invitation.getSender();
        if (sender.getId().equals(currentUser.getId())) {
            throw new AppException("You cannot pair with yourself", HttpStatus.BAD_REQUEST);
        }

        // Unpair any previous partners if exists
        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));

        user.setPartner(sender);
        sender.setPartner(user);

        invitation.setStatus(InvitationStatus.ACCEPTED);
        invitationRepository.save(invitation);

        userRepository.save(user);
        userRepository.save(sender);

        log.info("Paired user {} with partner {}", user.getEmail(), sender.getEmail());

        return PartnerStatusResponse.builder()
                .isPaired(true)
                .partner(authService.toPartnerDto(sender))
                .build();
    }

    @Transactional
    public PartnerStatusResponse unpairPartner(User currentUser) {
        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));

        if (user.getPartner() != null) {
            User partner = user.getPartner();
            user.setPartner(null);
            partner.setPartner(null);
            userRepository.save(user);
            userRepository.save(partner);
            log.info("Unpaired user {} and {}", user.getEmail(), partner.getEmail());
        }

        return PartnerStatusResponse.builder()
                .isPaired(false)
                .partner(null)
                .build();
    }

    @Transactional(readOnly = true)
    public PartnerStatusResponse getPartnerStatus(User currentUser) {
        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));

        boolean isPaired = user.getPartner() != null;
        PartnerDto partnerDto = isPaired ? authService.toPartnerDto(user.getPartner()) : null;

        String activeInviteCode = null;
        LocalDateTime inviteExpiresAt = null;

        if (!isPaired) {
            Optional<PartnerInvitation> activeInvite = invitationRepository
                    .findFirstBySenderAndStatusAndExpiresAtAfterOrderByCreatedAtDesc(user, InvitationStatus.PENDING, LocalDateTime.now());
            if (activeInvite.isPresent()) {
                activeInviteCode = activeInvite.get().getCode();
                inviteExpiresAt = activeInvite.get().getExpiresAt();
            }
        }

        return PartnerStatusResponse.builder()
                .isPaired(isPaired)
                .partner(partnerDto)
                .activeInviteCode(activeInviteCode)
                .inviteExpiresAt(inviteExpiresAt)
                .build();
    }

    private String generateInviteCode() {
        StringBuilder sb = new StringBuilder(8);
        for (int i = 0; i < 8; i++) {
            sb.append(CHARACTERS.charAt(RANDOM.nextInt(CHARACTERS.length())));
        }
        return sb.toString();
    }
}
