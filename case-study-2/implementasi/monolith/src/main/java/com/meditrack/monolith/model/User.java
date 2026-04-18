package com.meditrack.monolith.model;

public class User {
    private final String id;
    private final String username;
    private final String email;
    private final String role;

    public User(String id, String username, String email, String role) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.role = role;
    }

    public String getId() {
        return id;
    }

    public String getUsername() {
        return username;
    }

    public String getEmail() {
        return email;
    }

    public String getRole() {
        return role;
    }
}
