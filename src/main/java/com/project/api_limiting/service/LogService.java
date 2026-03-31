package com.project.api_limiting.service;

import com.project.api_limiting.entity.RequestLog;
import com.project.api_limiting.entity.User;
import com.project.api_limiting.repository.RequestLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class LogService {

    private final RequestLogRepository requestLogRepository;

    public void logRequest(User user, String endpoint, String method, Integer status, String ipAddress) {
        RequestLog log = RequestLog.builder()
                .user(user)
                .endpoint(endpoint)
                .method(method)
                .status(status)
                .ipAddress(ipAddress)
                .build();
        requestLogRepository.save(log);
    }

    public List<RequestLog> getUserLogs(User user) {
        return requestLogRepository.findByUserOrderByTimestampDesc(user);
    }
}
