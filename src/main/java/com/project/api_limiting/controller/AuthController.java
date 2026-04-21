package com.project.api_limiting.controller;

import com.project.api_limiting.dto.AuthRequest;
import com.project.api_limiting.entity.User;
import com.project.api_limiting.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody AuthRequest request) {
        // Check name is provided for registration
        if (request.getName() == null || request.getName().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "Validation failed",
                    "messages", java.util.List.of("Full name is required for registration")));
        }

        // Check if the email already exists
        if (authService.emailExists(request.getEmail())) {
            return ResponseEntity.status(409).body(Map.of(
                    "error", "User already exists",
                    "messages",
                    java.util.List.of("An account with this email already exists. Please sign in instead.")));
        }

        User user = authService.register(request);
        return ResponseEntity.ok(user);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody AuthRequest request) {
        Optional<User> user = authService.login(request);
        if (user.isPresent()) {
            return ResponseEntity.ok(user.get());
        }

        // Check if the email exists to give a more helpful error
        if (!authService.emailExists(request.getEmail())) {
            return ResponseEntity.status(404).body(Map.of(
                    "error", "User not found",
                    "messages", java.util.List.of("No account found with this email. Please register first.")));
        }

        return ResponseEntity.status(401).body(Map.of(
                "error", "Invalid credentials",
                "messages", java.util.List.of("The password you entered is incorrect.")));
    }

    @GetMapping("/check-email")
    public ResponseEntity<?> checkEmail(@RequestParam String email) {
        boolean exists = authService.emailExists(email);
        return ResponseEntity.ok(Map.of("exists", exists));
    }
}
