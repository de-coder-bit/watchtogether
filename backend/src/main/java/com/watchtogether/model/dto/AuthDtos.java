package com.watchtogether.model.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

public class AuthDtos {

    public static class RegisterRequest {
        @NotBlank(message = "Username is required")
        @Size(min = 3, max = 30, message = "Username must be between 3 and 30 characters")
        private String username;

        @NotBlank(message = "Email is required")
        @Email(message = "Email must be a valid email address")
        private String email;

        @NotBlank(message = "Password is required")
        @Size(min = 6, max = 100, message = "Password must be at least 6 characters")
        private String password;

        private String avatarUrl;

        public RegisterRequest() {}

        public RegisterRequest(String username, String email, String password, String avatarUrl) {
            this.username = username;
            this.email = email;
            this.password = password;
            this.avatarUrl = avatarUrl;
        }

        public static Builder builder() { return new Builder(); }

        public static class Builder {
            private String username;
            private String email;
            private String password;
            private String avatarUrl;

            public Builder username(String username) { this.username = username; return this; }
            public Builder email(String email) { this.email = email; return this; }
            public Builder password(String password) { this.password = password; return this; }
            public Builder avatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; return this; }

            public RegisterRequest build() {
                return new RegisterRequest(username, email, password, avatarUrl);
            }
        }

        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
        public String getAvatarUrl() { return avatarUrl; }
        public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }
    }

    public static class LoginRequest {
        @NotBlank(message = "Email is required")
        private String email;

        @NotBlank(message = "Password is required")
        private String password;

        public LoginRequest() {}

        public LoginRequest(String email, String password) {
            this.email = email;
            this.password = password;
        }

        public static Builder builder() { return new Builder(); }

        public static class Builder {
            private String email;
            private String password;

            public Builder email(String email) { this.email = email; return this; }
            public Builder password(String password) { this.password = password; return this; }

            public LoginRequest build() {
                return new LoginRequest(email, password);
            }
        }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }

    public static class AuthResponse {
        private String token;
        private String tokenType;
        private Long expiresIn;
        private UserDto user;

        public AuthResponse() {}

        public AuthResponse(String token, String tokenType, Long expiresIn, UserDto user) {
            this.token = token;
            this.tokenType = tokenType;
            this.expiresIn = expiresIn;
            this.user = user;
        }

        public static Builder builder() { return new Builder(); }

        public static class Builder {
            private String token;
            private String tokenType = "Bearer";
            private Long expiresIn;
            private UserDto user;

            public Builder token(String token) { this.token = token; return this; }
            public Builder tokenType(String tokenType) { this.tokenType = tokenType; return this; }
            public Builder expiresIn(Long expiresIn) { this.expiresIn = expiresIn; return this; }
            public Builder user(UserDto user) { this.user = user; return this; }

            public AuthResponse build() {
                return new AuthResponse(token, tokenType, expiresIn, user);
            }
        }

        public String getToken() { return token; }
        public void setToken(String token) { this.token = token; }
        public String getTokenType() { return tokenType; }
        public void setTokenType(String tokenType) { this.tokenType = tokenType; }
        public Long getExpiresIn() { return expiresIn; }
        public void setExpiresIn(Long expiresIn) { this.expiresIn = expiresIn; }
        public UserDto getUser() { return user; }
        public void setUser(UserDto user) { this.user = user; }
    }

    public static class UserDto {
        private Long id;
        private String username;
        private String email;
        private String avatarUrl;
        private String role;
        private PartnerDto partner;
        private LocalDateTime createdAt;

        public UserDto() {}

        public UserDto(Long id, String username, String email, String avatarUrl, String role, PartnerDto partner, LocalDateTime createdAt) {
            this.id = id;
            this.username = username;
            this.email = email;
            this.avatarUrl = avatarUrl;
            this.role = role;
            this.partner = partner;
            this.createdAt = createdAt;
        }

        public static Builder builder() { return new Builder(); }

        public static class Builder {
            private Long id;
            private String username;
            private String email;
            private String avatarUrl;
            private String role;
            private PartnerDto partner;
            private LocalDateTime createdAt;

            public Builder id(Long id) { this.id = id; return this; }
            public Builder username(String username) { this.username = username; return this; }
            public Builder email(String email) { this.email = email; return this; }
            public Builder avatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; return this; }
            public Builder role(String role) { this.role = role; return this; }
            public Builder partner(PartnerDto partner) { this.partner = partner; return this; }
            public Builder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

            public UserDto build() {
                return new UserDto(id, username, email, avatarUrl, role, partner, createdAt);
            }
        }

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getAvatarUrl() { return avatarUrl; }
        public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }
        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }
        public PartnerDto getPartner() { return partner; }
        public void setPartner(PartnerDto partner) { this.partner = partner; }
        public LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    }

    public static class PartnerDto {
        private Long id;
        private String username;
        private String email;
        private String avatarUrl;

        public PartnerDto() {}

        public PartnerDto(Long id, String username, String email, String avatarUrl) {
            this.id = id;
            this.username = username;
            this.email = email;
            this.avatarUrl = avatarUrl;
        }

        public static Builder builder() { return new Builder(); }

        public static class Builder {
            private Long id;
            private String username;
            private String email;
            private String avatarUrl;

            public Builder id(Long id) { this.id = id; return this; }
            public Builder username(String username) { this.username = username; return this; }
            public Builder email(String email) { this.email = email; return this; }
            public Builder avatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; return this; }

            public PartnerDto build() {
                return new PartnerDto(id, username, email, avatarUrl);
            }
        }

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getAvatarUrl() { return avatarUrl; }
        public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }
    }
}
