package com.project.api_limiting.service;

import com.project.api_limiting.entity.RateLimitRule;
import com.project.api_limiting.entity.User;
import com.project.api_limiting.repository.RateLimitRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;


import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class RateLimiterService {

    private final RateLimitRepository rateLimitRepository;

    // In-memory cache to replace database queries (Simulates Redis)
    private final Map<String, TokenBucket> cache = new ConcurrentHashMap<>();

    private static class TokenBucket {
        double tokens;
        long lastRefillTimestamp;

        TokenBucket(double tokens, long lastRefillTimestamp) {
            this.tokens = tokens;
            this.lastRefillTimestamp = lastRefillTimestamp;
        }
    }

    public RateLimitRule saveRule(User user, Integer limitCount, Long timeWindow) {
        RateLimitRule rule = rateLimitRepository.findByUser(user)
                .orElse(RateLimitRule.builder().user(user).build());
        rule.setLimitCount(limitCount);
        rule.setTimeWindow(timeWindow);
        // Clear cache for this user so new rules apply immediately
        cache.keySet().removeIf(key -> key.startsWith(user.getId() + ":"));
        return rateLimitRepository.save(rule);
    }

    public boolean isAllowed(User user, String ipAddress) {
        RateLimitRule rule = rateLimitRepository.findByUser(user)
                .orElse(RateLimitRule.builder()
                        .limitCount(100) // default
                        .timeWindow(60L) // Default 1 minute
                        .build());

        String key = user.getId() + ":" + ipAddress;
        long now = System.currentTimeMillis();
        
        // Max capacity
        double capacity = rule.getLimitCount();
        // Tokens added per millisecond
        double refillRate = capacity / (rule.getTimeWindow() * 1000.0);

        TokenBucket bucket = cache.compute(key, (k, existingBucket) -> {
            if (existingBucket == null) {
                // Initial request: start with (capacity - 1) tokens
                return new TokenBucket(capacity - 1, now);
            }

            // Calculate how many tokens to add based on elapsed time
            long elapsedTime = now - existingBucket.lastRefillTimestamp;
            double newTokens = existingBucket.tokens + (elapsedTime * refillRate);
            
            // Cap at maximum capacity
            existingBucket.tokens = Math.min(capacity, newTokens);
            existingBucket.lastRefillTimestamp = now;

            if (existingBucket.tokens >= 1) {
                existingBucket.tokens -= 1; // Consume a token
            } else {
                existingBucket.tokens = -1; // Flag as blocked for this request
            }
            return existingBucket;
        });

        return bucket.tokens != -1;
    }
}
