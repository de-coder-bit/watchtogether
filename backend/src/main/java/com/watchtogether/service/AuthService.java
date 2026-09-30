package com.watchtogether.service;

import com.watchtogether.exception.AppException;
import com.watchtogether.model.dto.AuthDtos.*;
import com.watchtogether.model.entity.User;
import com.watchtogether.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new AppException("An account with this email already exists.");
        }
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new AppException("Username is already taken.");
        }

        String avatar = request.getAvatarUrl();
        if (avatar == null || avatar.isBlank()) {
            avatar = "https://api.dicebear.com/7.x/bottts/svg?seed=" + request.getUsername();
        }

        User user = User.builder()
                .username(request.getUsername().trim())
                .email(request.getEmail().trim().toLowerCase())
                .password(passwordEncoder.encode(request.getPassword()))
                .avatarUrl(avatar)
                .role("ROLE_USER")
                .build();

        user = userRepository.save(user);

        String token = jwtService.generateToken(user.getId(), user.getEmail(), user.getRole());

        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .expiresIn(jwtService.getExpirationTime())
                .user(toUserDto(user))
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail().trim().toLowerCase())
                .orElseThrow(() -> new AppException("Invalid email or password."));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new AppException("Invalid email or password.");
        }

        String token = jwtService.generateToken(user.getId(), user.getEmail(), user.getRole());

        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .expiresIn(jwtService.getExpirationTime())
                .user(toUserDto(user))
                .build();
    }

    public UserDto getCurrentUserDto(User user) {
        User refreshedUser = userRepository.findById(user.getId()).orElse(user);
        return toUserDto(refreshedUser);
    }

    public UserDto toUserDto(User user) {
        if (user == null) return null;

        PartnerDto partnerDto = null;
        if (user.getPartner() != null) {
            partnerDto = PartnerDto.builder()
                    .id(user.getPartner().getId())
                    .username(user.getPartner().getUsername())
                    .email(user.getPartner().getEmail())
                    .avatarUrl(user.getPartner().getAvatarUrl())
                    .build();
        }

        return UserDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .avatarUrl(user.getAvatarUrl())
                .role(user.getRole())
                .partner(partnerDto)
                .createdAt(user.getCreatedAt())
                .build();
    }
}
