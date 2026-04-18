package com.meditrack.monolith.service;

import com.meditrack.monolith.model.User;
import com.meditrack.monolith.repository.UserRepository;

public class AuthService {
    private final UserRepository userRepository;

    public AuthService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public String register(String id, String username, String email, String role) {
        userRepository.save(new User(id, username, email, role));
        return "User registered: " + username;
    }

    public String login(String username, String password) {
        return userRepository.findByUsername(username)
                .map(user -> "Login successful for: " + user.getUsername())
                .orElse("User not found");
    }

    public User findUser(String id) {
        return userRepository.findById(id).orElse(null);
    }
}
