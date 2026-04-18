package com.meditrack.monolith.controller;

import com.meditrack.monolith.service.AuthService;

public class UserController {
    private final AuthService authService;

    public UserController(AuthService authService) {
        this.authService = authService;
    }

    public String register(String id, String username, String email, String role) {
        return authService.register(id, username, email, role);
    }

    public String login(String username, String password) {
        return authService.login(username, password);
    }
}
