package com.meditrack.monolith.repository;

import com.meditrack.monolith.config.DatabaseConnection;
import com.meditrack.monolith.model.Report;

public class AnalyticsRepository {
    private final DatabaseConnection databaseConnection;

    public AnalyticsRepository(DatabaseConnection databaseConnection) {
        this.databaseConnection = databaseConnection;
    }

    public void save(Report report) {
        databaseConnection.getReports().add(report);
    }
}
