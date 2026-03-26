package com.meditrack.auth;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @PostMapping("/register")
    public String register(@RequestBody User user) {
        // Logic to register user
        return "User registered: " + user.getUsername();
    }

    @PostMapping("/login")
    public String login(@RequestBody LoginRequest request) {
        // Logic to authenticate user
        return "Login successful for: " + request.getUsername();
    }

    @GetMapping("/users/{id}")
    public User getUser(@PathVariable String id) {
        // Logic to get user by ID
        return new User(id, "user" + id, "patient");
    }
}

class User {
    private String id;
    private String username;
    private String role;

    public User(String id, String username, String role) {
        this.id = id;
        this.username = username;
        this.role = role;
    }

    // Getters and setters
    public String getId() { return id; }
    public String getUsername() { return username; }
    public String getRole() { return role; }
}

class LoginRequest {
    private String username;
    private String password;

    public String getUsername() { return username; }
    public String getPassword() { return password; }
}