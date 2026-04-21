package com.project.api_limiting.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class HomeController {

    @GetMapping("/")
    public ResponseEntity<?> home() {
        return ResponseEntity.ok(Map.of(
                "service", "MaxRate API",
                "status", "running",
                "version", "1.0.0",
                "docs", "Use /auth/register or /auth/login to get started"));
    }
}
