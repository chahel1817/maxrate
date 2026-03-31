package com.project.api_limiting.controller;

import com.project.api_limiting.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/debug")
@RequiredArgsConstructor
public class DebugController {

    private final UserRepository userRepository;

    @GetMapping("/db-status")
    public ResponseEntity<?> getDbStatus() {
        Map<String, Object> status = new HashMap<>();
        status.put("totalUsers", userRepository.count());
        status.put("allUsers", userRepository.findAll());
        return ResponseEntity.ok(status);
    }
}
