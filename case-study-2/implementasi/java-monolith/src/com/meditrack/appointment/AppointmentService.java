package com.meditrack.appointment;

import com.meditrack.db.DatabaseConnection;
import com.meditrack.user.UserService;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;

public class AppointmentService {
    private UserService userService = new UserService();

    public void bookAppointment(String patientUsername, String doctorUsername, String date) throws SQLException {
        // Check if user exists by calling UserService directly
        if (!userService.loginUser(patientUsername, "dummy")) { // Simplified check
            throw new SQLException("Patient not found");
        }

        Connection conn = DatabaseConnection.getConnection();
        PreparedStatement stmt = conn.prepareStatement("INSERT INTO appointments (patient, doctor, date) VALUES (?, ?, ?)");
        stmt.setString(1, patientUsername);
        stmt.setString(2, doctorUsername);
        stmt.setString(3, date);
        stmt.executeUpdate();
    }
}