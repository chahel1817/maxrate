package com.project.api_limiting.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class AuthRequest {

    @Size(min = 2, max = 50, message = "Name must be between 2 and 50 characters")
    private String name; // optional for login

    @NotBlank(message = "Email is required")
    @Email(message = "Please provide a valid email address")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 6, max = 100, message = "Password must be at least 6 characters")
    private String password;
}
