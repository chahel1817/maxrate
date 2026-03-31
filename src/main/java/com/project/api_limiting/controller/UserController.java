package com.project.api_limiting.controller;

import com.project.api_limiting.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/user")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;
    private final com.project.api_limiting.service.AuthService authService;

    @GetMapping("/api-key")
    public ResponseEntity<?> getApiKey(@RequestParam Long userId) {
        return userRepository.findById(userId)
                .map(user -> ResponseEntity.ok(java.util.Map.of("apiKey", user.getApiKey())))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/regenerate-key")
    public ResponseEntity<?> regenerateApiKey(@RequestParam Long userId) {
        return userRepository.findById(userId)
                .map(user -> {
                    user.setApiKey(authService.generateApiKey());
                    userRepository.save(user);
                    return ResponseEntity.ok(java.util.Map.of("apiKey", user.getApiKey()));
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
