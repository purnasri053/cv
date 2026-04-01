package com.cvscanner.controller;

import com.cvscanner.dto.LoginRequest;
import com.cvscanner.dto.LoginResponse;
import com.cvscanner.dto.RegisterRequest;
import com.cvscanner.entity.User;
import com.cvscanner.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
public class AuthController {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public AuthController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping("/")
    public String home() {
        return "CVScanner Spring Boot backend is running!";
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest req) {
        if (req.getFull_name() == null || req.getEmail() == null ||
            req.getPassword() == null || req.getRole() == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "All fields are required"));
        }
        if (!req.getRole().equals("candidate") && !req.getRole().equals("hr")) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid role"));
        }
        if (userRepository.existsByEmail(req.getEmail())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email already registered"));
        }

        User user = new User();
        user.setFullName(req.getFull_name());
        user.setEmail(req.getEmail());
        user.setPasswordHash(passwordEncoder.encode(req.getPassword()));
        user.setRole(User.Role.valueOf(req.getRole()));
        userRepository.save(user);

        String roleName = req.getRole().substring(0, 1).toUpperCase() + req.getRole().substring(1);
        return ResponseEntity.status(201).body(Map.of("message", roleName + " registered successfully"));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req) {
        if (req.getEmail() == null || req.getPassword() == null || req.getRole() == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email, password, and role are required"));
        }

        User.Role role;
        try {
            role = User.Role.valueOf(req.getRole());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid role"));
        }

        Optional<User> userOpt = userRepository.findByEmailAndRole(req.getEmail(), role);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "User not found"));
        }

        User user = userOpt.get();
        if (!passwordEncoder.matches(req.getPassword(), user.getPasswordHash())) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid password"));
        }

        return ResponseEntity.ok(new LoginResponse(
            "Login successful",
            new LoginResponse.UserDto(user.getId(), user.getFullName(), user.getEmail(), user.getRole().name())
        ));
    }
}
