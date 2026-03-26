package com.meditrack.payment;

import com.meditrack.db.DatabaseConnection;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;

public class PaymentService {
    public void processPayment(String patientId, double amount) throws SQLException {
        Connection conn = DatabaseConnection.getConnection();
        PreparedStatement stmt = conn.prepareStatement("INSERT INTO payments (patient_id, amount) VALUES (?, ?)");
        stmt.setString(1, patientId);
        stmt.setDouble(2, amount);
        stmt.executeUpdate();
    }
}