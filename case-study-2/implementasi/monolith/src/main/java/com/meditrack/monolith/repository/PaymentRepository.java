package com.meditrack.monolith.repository;

import com.meditrack.monolith.config.DatabaseConnection;
import com.meditrack.monolith.model.Payment;

public class PaymentRepository {
    private final DatabaseConnection databaseConnection;

    public PaymentRepository(DatabaseConnection databaseConnection) {
        this.databaseConnection = databaseConnection;
    }

    public void save(Payment payment) {
        databaseConnection.getPayments().add(payment);
    }
}
