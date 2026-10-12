package com.watchtogether.repository;

import com.watchtogether.model.entity.PartnerInvitation;
import com.watchtogether.model.entity.User;
import com.watchtogether.model.enums.InvitationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PartnerInvitationRepository extends JpaRepository<PartnerInvitation, Long> {
    Optional<PartnerInvitation> findByCodeAndStatus(String code, InvitationStatus status);
    List<PartnerInvitation> findBySenderAndStatusAndExpiresAtAfter(User sender, InvitationStatus status, LocalDateTime now);
    Optional<PartnerInvitation> findFirstBySenderAndStatusAndExpiresAtAfterOrderByCreatedAtDesc(User sender, InvitationStatus status, LocalDateTime now);
}
