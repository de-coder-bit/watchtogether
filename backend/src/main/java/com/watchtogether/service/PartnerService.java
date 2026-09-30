package com.watchtogether.service;

import com.watchtogether.exception.AppException;
import com.watchtogether.exception.ResourceNotFoundException;
import com.watchtogether.model.dto.AuthDtos;
import com.watchtogether.model.dto.PartnerDtos.*;
import com.watchtogether.model.entity.PartnerInvitation;
import com.watchtogether.model.entity.User;
import com.watchtogether.model.enums.InvitationStatus;
import com.watchtogether.repository.PartnerInvitationRepository;
import com.watchtogether.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class PartnerService {

    private static final Logger log = LoggerFactory.getLogger(PartnerService.class);

    private final PartnerInvitationRepository invitationRepository;
    private final UserRepository userRepository;
    private final AuthService authService;

    private static final String CHARACTERS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private static final SecureRandom RANDOM = new SecureRandom();

    public PartnerService(PartnerInvitationRepository invitationRepository, UserRepository userRepository, AuthService authService) {
        this.invitationRepository = invitationRepository;
        this.userRepository = userRepository;
        this.authService = authService;
    }

    @Transactional
    public PartnerInviteResponse createInviteCode(User user) {
        User sender = userRepository.findById(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", user.getId()));

        if (sender.getPartner() != null) {
            throw new AppException("You are already paired with " + sender.getPartner().getUsername() + ". Unpair first to link a new partner.");
        }

        Optional<PartnerInvitation> existingInvite = invitationRepository
                .findFirstBySenderAndStatusAndExpiresAtAfterOrderByCreatedAtDesc(
                        sender, InvitationStatus.PENDING, LocalDateTime.now()
                );

        if (existingInvite.isPresent()) {
            PartnerInvitation inv = existingInvite.get();
            return PartnerInviteResponse.builder()
                    .inviteCode(inv.getCode())
                    .expiresAt(inv.getExpiresAt())
                    .inviteUrl("/pair?code=" + inv.getCode())
                    .build();
        }

        String code = generateCode();
        PartnerInvitation invitation = PartnerInvitation.builder()
                .code(code)
                .sender(sender)
                .status(InvitationStatus.PENDING)
                .expiresAt(LocalDateTime.now().plusDays(2))
                .build();

        invitationRepository.save(invitation);

        return PartnerInviteResponse.builder()
                .inviteCode(code)
                .expiresAt(invitation.getExpiresAt())
                .inviteUrl("/pair?code=" + code)
                .build();
    }

    @Transactional
    public PartnerStatusResponse pairWithPartner(User currentUser, PairRequest request) {
        String code = request.getInviteCode().trim().toUpperCase();

        PartnerInvitation invitation = invitationRepository.findByCodeAndStatus(code, InvitationStatus.PENDING)
                .orElseThrow(() -> new AppException("Invalid or expired invite code."));

        if (invitation.getExpiresAt().isBefore(LocalDateTime.now())) {
            invitation.setStatus(InvitationStatus.EXPIRED);
            invitationRepository.save(invitation);
            throw new AppException("This invite code has expired.");
        }

        User sender = invitation.getSender();
        User receiver = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", currentUser.getId()));

        if (sender.getId().equals(receiver.getId())) {
            throw new AppException("You cannot pair with yourself using your own invite code!");
        }

        if (receiver.getPartner() != null) {
            throw new AppException("You are already paired with " + receiver.getPartner().getUsername() + ". Please unpair first.");
        }

        sender.setPartner(receiver);
        receiver.setPartner(sender);

        userRepository.save(sender);
        userRepository.save(receiver);

        invitation.setStatus(InvitationStatus.ACCEPTED);
        invitationRepository.save(invitation);

        log.info("Users {} and {} have successfully paired as partners", sender.getUsername(), receiver.getUsername());

        return getPartnerStatus(receiver);
    }

    @Transactional(readOnly = true)
    public PartnerStatusResponse getPartnerStatus(User user) {
        User freshUser = userRepository.findById(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", user.getId()));

        boolean isPaired = freshUser.getPartner() != null;
        AuthDtos.PartnerDto partnerDto = null;
        if (isPaired) {
            User p = freshUser.getPartner();
            partnerDto = AuthDtos.PartnerDto.builder()
                    .id(p.getId())
                    .username(p.getUsername())
                    .email(p.getEmail())
                    .avatarUrl(p.getAvatarUrl())
                    .build();
        }

        String activeCode = null;
        LocalDateTime expiresAt = null;

        if (!isPaired) {
            Optional<PartnerInvitation> activeInvite = invitationRepository
                    .findFirstBySenderAndStatusAndExpiresAtAfterOrderByCreatedAtDesc(
                            freshUser, InvitationStatus.PENDING, LocalDateTime.now()
                    );
            if (activeInvite.isPresent()) {
                activeCode = activeInvite.get().getCode();
                expiresAt = activeInvite.get().getExpiresAt();
            }
        }

        return PartnerStatusResponse.builder()
                .isPaired(isPaired)
                .partner(partnerDto)
                .activeInviteCode(activeCode)
                .inviteExpiresAt(expiresAt)
                .build();
    }

    @Transactional
    public void unpair(User user) {
        User me = userRepository.findById(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", user.getId()));

        if (me.getPartner() != null) {
            User partner = me.getPartner();
            partner.setPartner(null);
            me.setPartner(null);
            userRepository.save(partner);
            userRepository.save(me);
            log.info("Users {} and {} have unpaired", me.getUsername(), partner.getUsername());
        }
    }

    private String generateCode() {
        StringBuilder sb = new StringBuilder("WT-");
        for (int i = 0; i < 6; i++) {
            sb.append(CHARACTERS.charAt(RANDOM.nextInt(CHARACTERS.length())));
        }
        return sb.toString();
    }
}
