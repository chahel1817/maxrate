package com.project.api_limiting.repository;

import com.project.api_limiting.entity.RateLimitRule;
import com.project.api_limiting.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.Optional;

public interface RateLimitRepository extends JpaRepository<RateLimitRule, Long> {
    Optional<RateLimitRule> findByUser(User user);

    @Query("SELECT r FROM RateLimitRule r JOIN FETCH r.user")
    List<RateLimitRule> findAllWithUser();
}
