package com.meditrack.monolith.repository;

import com.meditrack.monolith.config.DatabaseConnection;
import com.meditrack.monolith.model.MedicalRecord;

public class EHRRepository {
    private final DatabaseConnection databaseConnection;

    public EHRRepository(DatabaseConnection databaseConnection) {
        this.databaseConnection = databaseConnection;
    }

    public void save(MedicalRecord medicalRecord) {
        databaseConnection.getMedicalRecords().add(medicalRecord);
    }
}
