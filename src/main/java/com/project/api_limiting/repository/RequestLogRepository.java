package com.project.api_limiting.repository;

import com.project.api_limiting.entity.RequestLog;
import com.project.api_limiting.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface RequestLogRepository extends JpaRepository<RequestLog, Long> {
    List<RequestLog> findByUserOrderByTimestampDesc(User user);

    @Query("SELECT COUNT(l) FROM RequestLog l WHERE l.user = :user AND l.ipAddress = :ip AND l.timestamp >= :since")
    long countByUserAndIpAddressAndTimestampAfter(@Param("user") User user, @Param("ip") String ip,
            @Param("since") LocalDateTime since);

    long countByStatus(Integer status);
}
