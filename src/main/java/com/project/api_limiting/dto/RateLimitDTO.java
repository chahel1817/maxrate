package com.project.api_limiting.dto;

import lombok.Data;

@Data
public class RateLimitDTO {
    private Integer limitCount;
    private Long timeWindow;
}
