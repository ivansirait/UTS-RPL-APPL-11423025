package com.meditrack.monolith.repository;

import com.meditrack.monolith.config.DatabaseConnection;
import com.meditrack.monolith.model.Appointment;

import java.util.Optional;

public class AppointmentRepository {
    private final DatabaseConnection databaseConnection;

    public AppointmentRepository(DatabaseConnection databaseConnection) {
        this.databaseConnection = databaseConnection;
    }

    public void save(Appointment appointment) {
        databaseConnection.getAppointments().add(appointment);
    }

    public Optional<Appointment> findById(String id) {
        return databaseConnection.getAppointments().stream().filter(appointment -> appointment.getId().equals(id)).findFirst();
    }
}
