package com.project.api_limiting.controller;

import com.project.api_limiting.entity.RateLimitRule;
import com.project.api_limiting.repository.RateLimitRepository;
import com.project.api_limiting.repository.UserRepository;
import com.project.api_limiting.service.RateLimiterService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/rate-limit")
@RequiredArgsConstructor
public class RateLimitController {

    private final RateLimiterService rateLimiterService;
    private final RateLimitRepository rateLimitRepository;
    private final UserRepository userRepository;

    @PostMapping
    public ResponseEntity<?> createRule(@RequestBody RateLimitRule rule, @RequestParam Long userId) {
        return userRepository.findById(userId)
                .map(user -> {
                    RateLimitRule saved = rateLimiterService.saveRule(user, rule.getLimitCount(), rule.getTimeWindow());
                    return ResponseEntity.ok(saved);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping
    public ResponseEntity<?> getAllRules(@RequestParam(required = false) Long userId) {
        if (userId != null) {
            return userRepository.findById(userId)
                    .map(user -> {
                        java.util.Optional<RateLimitRule> ruleOpt = rateLimitRepository.findByUser(user);
                        if (ruleOpt.isPresent()) {
                            return ResponseEntity.ok(java.util.List.of(ruleOpt.get()));
                        } else {
                            return ResponseEntity.ok(java.util.List.of());
                        }
                    })
                    .orElse(ResponseEntity.notFound().build());
        }
        return ResponseEntity.ok(rateLimitRepository.findAllWithUser());
    }

    @PutMapping("/{id}")
    public ResponseEntity<RateLimitRule> updateRule(@PathVariable Long id, @RequestBody RateLimitRule ruleDetails) {
        return rateLimitRepository.findById(id)
                .map(rule -> {
                    rule.setLimitCount(ruleDetails.getLimitCount());
                    rule.setTimeWindow(ruleDetails.getTimeWindow());
                    return ResponseEntity.ok(rateLimitRepository.save(rule));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteRule(@PathVariable Long id) {
        return rateLimitRepository.findById(id)
                .map(rule -> {
                    rateLimitRepository.delete(rule);
                    return ResponseEntity.ok().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
