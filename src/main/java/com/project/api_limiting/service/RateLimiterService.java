package com.project.api_limiting.service;

import com.project.api_limiting.entity.RateLimitRule;
import com.project.api_limiting.entity.User;
import com.project.api_limiting.repository.RateLimitRepository;
import com.project.api_limiting.repository.RequestLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class RateLimiterService {

    private final RateLimitRepository rateLimitRepository;
    private final RequestLogRepository requestLogRepository;

    public RateLimitRule saveRule(User user, Integer limitCount, Long timeWindow) {
        RateLimitRule rule = rateLimitRepository.findByUser(user)
                .orElse(RateLimitRule.builder().user(user).build());
        rule.setLimitCount(limitCount);
        rule.setTimeWindow(timeWindow);
        return rateLimitRepository.save(rule);
    }

    public boolean isAllowed(User user, String ipAddress) {
        RateLimitRule rule = rateLimitRepository.findByUser(user)
                .orElse(RateLimitRule.builder()
                        .limitCount(100) // default
                        .timeWindow(60L) // Default 1 minute
                        .build());

        LocalDateTime windowStart = LocalDateTime.now().minusSeconds(rule.getTimeWindow());

        // Count only requests from this SPECIFIC IP for this user
        long requestCount = requestLogRepository.countByUserAndIpAddressAndTimestampAfter(user, ipAddress, windowStart);

        return requestCount < rule.getLimitCount();
    }
}
