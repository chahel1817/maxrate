package com.project.api_limiting.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "rate_limit_rules")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RateLimitRule {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "limit_count", nullable = false)
    private Integer limitCount;

    @Column(name = "time_window", nullable = false)
    private Long timeWindow; // in seconds
}
