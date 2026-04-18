package com.meditrack.monolith.repository;

import com.meditrack.monolith.config.DatabaseConnection;
import com.meditrack.monolith.model.User;

import java.util.Optional;

public class UserRepository {
    private final DatabaseConnection databaseConnection;

    public UserRepository(DatabaseConnection databaseConnection) {
        this.databaseConnection = databaseConnection;
    }

    public void save(User user) {
        databaseConnection.getUsers().add(user);
    }

    public Optional<User> findById(String id) {
        return databaseConnection.getUsers().stream().filter(user -> user.getId().equals(id)).findFirst();
    }

    public Optional<User> findByUsername(String username) {
        return databaseConnection.getUsers().stream().filter(user -> user.getUsername().equals(username)).findFirst();
    }
}
