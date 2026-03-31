package com.project.api_limiting.dto;

import lombok.Data;

@Data
public class AuthRequest {
    private String email;
    private String password;
    private String name; // optional for login
}
