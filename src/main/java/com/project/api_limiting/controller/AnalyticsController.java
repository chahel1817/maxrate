package com.project.api_limiting.controller;

import com.project.api_limiting.entity.RequestLog;
import com.project.api_limiting.repository.RequestLogRepository;
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

    @GetMapping("/logs")
    public ResponseEntity<List<RequestLog>> getAllLogs() {
        return ResponseEntity.ok(logRepository.findAll());
    }

    @GetMapping("/analytics/summary")
    public ResponseEntity<?> getSummary() {
        Map<String, Object> summary = new HashMap<>();
        summary.put("totalRequests", logRepository.count());
        // For individual user summary logic:
        // summary.put("rateLimitedCount", logRepository.findAll().stream().filter(l ->
        // l.getStatus() == 429).count());
        return ResponseEntity.ok(summary);
    }
}
