package com.meditrack.pharmacy;

import com.meditrack.db.DatabaseConnection;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;

public class PharmacyService {
    public void dispenseMedication(String patientId, String medication) throws SQLException {
        Connection conn = DatabaseConnection.getConnection();
        PreparedStatement stmt = conn.prepareStatement("INSERT INTO prescriptions (patient_id, medication) VALUES (?, ?)");
        stmt.setString(1, patientId);
        stmt.setString(2, medication);
        stmt.executeUpdate();
    }
}