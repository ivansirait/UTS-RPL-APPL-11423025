package com.meditrack.monolith.repository;

import com.meditrack.monolith.config.DatabaseConnection;
import com.meditrack.monolith.model.Prescription;

public class PharmacyRepository {
    private final DatabaseConnection databaseConnection;

    public PharmacyRepository(DatabaseConnection databaseConnection) {
        this.databaseConnection = databaseConnection;
    }

    public void save(Prescription prescription) {
        databaseConnection.getPrescriptions().add(prescription);
    }
}
