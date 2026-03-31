package com.project.api_limiting.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "request_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RequestLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String endpoint;

    @Column(nullable = false)
    private String method;

    @Column(nullable = false)
    private Integer status;

    @Column(nullable = false, updatable = false)
    private LocalDateTime timestamp;

    @Column(name = "ip_address", nullable = false)
    private String ipAddress;

    @PrePersist
    protected void onCreate() {
        timestamp = LocalDateTime.now();
    }
}
