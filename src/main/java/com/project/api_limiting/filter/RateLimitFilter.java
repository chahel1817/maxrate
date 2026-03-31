package com.project.api_limiting.filter;

import com.project.api_limiting.entity.User;
import com.project.api_limiting.service.AuthService;
import com.project.api_limiting.service.LogService;
import com.project.api_limiting.service.RateLimiterService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class RateLimitFilter extends OncePerRequestFilter {

    private final AuthService authService;
    private final RateLimiterService rateLimiterService;
    private final LogService logService;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {

        String path = request.getRequestURI();

        // Only filter specific paths or all /api/** paths
        if (!path.startsWith("/api/")) {
            filterChain.doFilter(request, response);
            return;
        }

        String apiKey = request.getHeader("x-api-key");
        if (apiKey == null || apiKey.isEmpty()) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("Missing API Key");
            return;
        }

        Optional<User> userOpt = authService.findByApiKey(apiKey);
        if (userOpt.isEmpty()) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("Invalid API Key");
            return;
        }

        User user = userOpt.get();
        String ip = request.getRemoteAddr();

        if (!rateLimiterService.isAllowed(user, ip)) {
            logService.logRequest(user, path, request.getMethod(), 429, ip);
            response.setStatus(429); // Too Many Requests
            response.getWriter().write("Rate limit exceeded");
            return;
        }

        filterChain.doFilter(request, response);

        logService.logRequest(user, path, request.getMethod(), response.getStatus(), ip);
    }
}
