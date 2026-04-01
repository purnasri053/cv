package com.cvscanner.dto;

public class LoginResponse {
    private String message;
    private UserDto user;

    public LoginResponse(String message, UserDto user) {
        this.message = message;
        this.user = user;
    }

    public String getMessage() { return message; }
    public UserDto getUser() { return user; }

    public static class UserDto {
        private Long id;
        private String full_name;
        private String email;
        private String role;

        public UserDto(Long id, String full_name, String email, String role) {
            this.id = id;
            this.full_name = full_name;
            this.email = email;
            this.role = role;
        }

        public Long getId() { return id; }
        public String getFull_name() { return full_name; }
        public String getEmail() { return email; }
        public String getRole() { return role; }
    }
}
