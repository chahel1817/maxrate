package com.project.api_limiting.controller;

import com.project.api_limiting.entity.RequestLog;
import com.project.api_limiting.repository.RequestLogRepository;
import com.project.api_limiting.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
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
    public ResponseEntity<?> getAllLogs(@RequestParam(required = false) Long userId, @org.springframework.security.core.annotation.AuthenticationPrincipal com.project.api_limiting.entity.User authUser) {
        if (userId != null && !userId.equals(authUser.getId())) return ResponseEntity.status(403).build();
        if (userId != null) {
            return userRepository.findById(userId)
                    .map(user -> ResponseEntity.ok(logRepository.findByUserOrderByTimestampDesc(user)))
                    .orElse(ResponseEntity.notFound().build());
        }
        return ResponseEntity.ok(logRepository.findAll());
    }

    @GetMapping("/analytics/summary")
    public ResponseEntity<?> getSummary(@RequestParam(required = false) Long userId, @org.springframework.security.core.annotation.AuthenticationPrincipal com.project.api_limiting.entity.User authUser) {
        if (userId != null && !userId.equals(authUser.getId())) return ResponseEntity.status(403).build();
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

    @GetMapping("/analytics/traffic")
    public ResponseEntity<?> getTrafficData(@RequestParam Long userId,
                                            @RequestParam(defaultValue = "7") int buckets,
                                            @org.springframework.security.core.annotation.AuthenticationPrincipal com.project.api_limiting.entity.User authUser) {
        if (!userId.equals(authUser.getId())) return ResponseEntity.status(403).build();
        return userRepository.findById(userId)
                .map(user -> {
                    LocalDateTime now = LocalDateTime.now();
                    // Cover the last 30 minutes, split into equal buckets
                    int totalMinutes = buckets * 5;
                    LocalDateTime start = now.minusMinutes(totalMinutes);

                    List<RequestLog> logs = logRepository
                            .findByUserAndTimestampAfterOrderByTimestampAsc(user, start);

                    List<Map<String, Object>> dataPoints = new ArrayList<>();
                    for (int i = 0; i < buckets; i++) {
                        LocalDateTime bucketStart = start.plusMinutes((long) i * 5);
                        LocalDateTime bucketEnd = start.plusMinutes((long) (i + 1) * 5);

                        long total = logs.stream()
                                .filter(l -> !l.getTimestamp().isBefore(bucketStart) && l.getTimestamp().isBefore(bucketEnd))
                                .count();
                        long blocked = logs.stream()
                                .filter(l -> !l.getTimestamp().isBefore(bucketStart) && l.getTimestamp().isBefore(bucketEnd) && l.getStatus() == 429)
                                .count();

                        Map<String, Object> point = new HashMap<>();
                        java.time.ZonedDateTime zdt = bucketStart.atZone(java.time.ZoneId.systemDefault());
                        point.put("time", zdt.toInstant().toString());
                        point.put("requests", total);
                        point.put("blocked", blocked);
                        dataPoints.add(point);
                    }

                    return ResponseEntity.ok(dataPoints);
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
