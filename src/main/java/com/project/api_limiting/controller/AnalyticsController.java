package com.project.api_limiting.controller;

import com.project.api_limiting.entity.RequestLog;
import com.project.api_limiting.repository.RequestLogRepository;
import com.project.api_limiting.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping
@RequiredArgsConstructor
public class AnalyticsController {

    private final RequestLogRepository logRepository;
    private final UserRepository userRepository;

    @GetMapping("/logs")
    public ResponseEntity<?> getAllLogs(@RequestParam(required = false) Long userId) {
        if (userId != null) {
            return userRepository.findById(userId)
                    .map(user -> ResponseEntity.ok(logRepository.findByUserOrderByTimestampDesc(user)))
                    .orElse(ResponseEntity.notFound().build());
        }
        return ResponseEntity.ok(logRepository.findAll());
    }

    @GetMapping("/analytics/summary")
    public ResponseEntity<?> getSummary(@RequestParam(required = false) Long userId) {
        Map<String, Object> summary = new HashMap<>();
        if (userId != null) {
            return userRepository.findById(userId)
                    .map(user -> {
                        summary.put("totalRequests", logRepository.countByUser(user));
                        summary.put("rateLimitedCount", logRepository.countByUserAndStatus(user, 429));
                        return ResponseEntity.ok(summary);
                    })
                    .orElse(ResponseEntity.notFound().build());
        }
        summary.put("totalRequests", logRepository.count());
        summary.put("rateLimitedCount", logRepository.countByStatus(429));
        return ResponseEntity.ok(summary);
    }
}
