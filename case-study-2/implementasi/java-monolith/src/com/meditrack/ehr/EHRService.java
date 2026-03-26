package com.meditrack.ehr;

import com.meditrack.db.DatabaseConnection;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

public class EHRService {
    public void addMedicalRecord(String patientId, String record) throws SQLException {
        Connection conn = DatabaseConnection.getConnection();
        PreparedStatement stmt = conn.prepareStatement("INSERT INTO medical_records (patient_id, record) VALUES (?, ?)");
        stmt.setString(1, patientId);
        stmt.setString(2, record);
        stmt.executeUpdate();
    }

    public String getMedicalRecord(String patientId) throws SQLException {
        Connection conn = DatabaseConnection.getConnection();
        PreparedStatement stmt = conn.prepareStatement("SELECT record FROM medical_records WHERE patient_id = ?");
        stmt.setString(1, patientId);
        ResultSet rs = stmt.executeQuery();
        if (rs.next()) {
            return rs.getString("record");
        }
        return null;
    }
}