package com.project.api_limiting.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class ApiTestController {

    @GetMapping("/hello")
    public ResponseEntity<?> hello() {
        Map<String, String> response = new HashMap<>();
        response.put("message", "Hello! You have successfully called the API.");
        response.put("status", "Success");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/data")
    public ResponseEntity<?> data() {
        Map<String, Object> response = new HashMap<>();
        response.put("data", new String[] { "item1", "item2", "item3" });
        response.put("secret", "This is protected data.");
        return ResponseEntity.ok(response);
    }
}
