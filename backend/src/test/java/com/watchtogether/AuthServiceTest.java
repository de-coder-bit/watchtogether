package com.watchtogether;

import com.watchtogether.model.dto.AuthDtos.*;
import com.watchtogether.model.dto.PartnerDtos.*;
import com.watchtogether.model.entity.User;
import com.watchtogether.repository.UserRepository;
import com.watchtogether.service.AuthService;
import com.watchtogether.service.PartnerService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
class AuthServiceTest {

    @Autowired
    private AuthService authService;

    @Autowired
    private PartnerService partnerService;

    @Autowired
    private UserRepository userRepository;

    @Test
    void testRegisterAndLogin() {
        RegisterRequest registerReq = RegisterRequest.builder()
                .username("TestUser")
                .email("testuser@example.com")
                .password("secret123")
                .build();

        AuthResponse authRes = authService.register(registerReq);
        assertNotNull(authRes.getToken());
        assertEquals("testuser@example.com", authRes.getUser().getEmail());

        LoginRequest loginReq = LoginRequest.builder()
                .email("testuser@example.com")
                .password("secret123")
                .build();

        AuthResponse loginRes = authService.login(loginReq);
        assertNotNull(loginRes.getToken());
        assertEquals("TestUser", loginRes.getUser().getUsername());
    }

    @Test
    void testPartnerPairingFlow() {
        User user1 = userRepository.save(User.builder()
                .username("PartnerOne")
                .email("p1@example.com")
                .password("pass123")
                .role("ROLE_USER")
                .build());

        User user2 = userRepository.save(User.builder()
                .username("PartnerTwo")
                .email("p2@example.com")
                .password("pass123")
                .role("ROLE_USER")
                .build());

        PartnerInviteResponse invite = partnerService.createInviteCode(user1);
        assertNotNull(invite.getInviteCode());
        assertTrue(invite.getInviteCode().startsWith("WT-"));

        PartnerStatusResponse pairResult = partnerService.pairWithPartner(user2, new PairRequest(invite.getInviteCode()));
        assertTrue(pairResult.isPaired());
        assertEquals("PartnerOne", pairResult.getPartner().getUsername());
    }
}
