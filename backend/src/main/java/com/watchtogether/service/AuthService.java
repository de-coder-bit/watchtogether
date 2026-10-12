package com.watchtogether.service;

import com.watchtogether.exception.AppException;
import com.watchtogether.model.dto.AuthDtos.*;
import com.watchtogether.model.entity.User;
import com.watchtogether.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
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
        String email = request.getEmail().trim().toLowerCase();
        String username = request.getUsername().trim();

        if (userRepository.existsByEmail(email)) {
            throw new AppException("Email is already in use", HttpStatus.CONFLICT);
        }
        if (userRepository.existsByUsername(username)) {
            throw new AppException("Username is already taken", HttpStatus.CONFLICT);
        }

        String avatarUrl = request.getAvatarUrl();
        if (avatarUrl == null || avatarUrl.isBlank()) {
            avatarUrl = "https://api.dicebear.com/7.x/bottts/svg?seed=" + username;
        }

        User user = User.builder()
                .email(email)
                .username(username)
                .password(passwordEncoder.encode(request.getPassword()))
                .avatarUrl(avatarUrl)
                .role("ROLE_USER")
                .build();

        user = userRepository.save(user);
        log.info("Registered new user with id: {}, email: {}", user.getId(), user.getEmail());

        String token = jwtService.generateToken(user.getEmail(), user.getId(), user.getUsername());
        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .expiresIn(jwtService.getExpirationMs())
                .user(toUserDto(user))
                .build();
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException("Invalid email or password", HttpStatus.UNAUTHORIZED));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new AppException("Invalid email or password", HttpStatus.UNAUTHORIZED);
        }

        String token = jwtService.generateToken(user.getEmail(), user.getId(), user.getUsername());
        log.info("User {} logged in successfully", user.getEmail());

        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .expiresIn(jwtService.getExpirationMs())
                .user(toUserDto(user))
                .build();
    }

    @Transactional(readOnly = true)
    public UserDto getCurrentUser(User user) {
        User freshUser = userRepository.findById(user.getId())
                .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));
        return toUserDto(freshUser);
    }

    public UserDto toUserDto(User user) {
        if (user == null) return null;
        PartnerDto partnerDto = null;
        if (user.getPartner() != null) {
            User partner = user.getPartner();
            partnerDto = PartnerDto.builder()
                    .id(partner.getId())
                    .username(partner.getUsername())
                    .email(partner.getEmail())
                    .avatarUrl(partner.getAvatarUrl())
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

    public PartnerDto toPartnerDto(User user) {
        if (user == null) return null;
        return PartnerDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .avatarUrl(user.getAvatarUrl())
                .build();
    }
}
