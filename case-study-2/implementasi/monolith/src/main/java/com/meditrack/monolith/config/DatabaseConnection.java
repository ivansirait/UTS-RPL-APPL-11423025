package com.meditrack.monolith.config;

import com.meditrack.monolith.model.Appointment;
import com.meditrack.monolith.model.MedicalRecord;
import com.meditrack.monolith.model.Payment;
import com.meditrack.monolith.model.Prescription;
import com.meditrack.monolith.model.Report;
import com.meditrack.monolith.model.User;

import java.util.ArrayList;
import java.util.List;

public class DatabaseConnection {
    private final List<User> users = new ArrayList<>();
    private final List<Appointment> appointments = new ArrayList<>();
    private final List<MedicalRecord> medicalRecords = new ArrayList<>();
    private final List<Prescription> prescriptions = new ArrayList<>();
    private final List<Payment> payments = new ArrayList<>();
    private final List<Report> reports = new ArrayList<>();

    public List<User> getUsers() {
        return users;
    }

    public List<Appointment> getAppointments() {
        return appointments;
    }

    public List<MedicalRecord> getMedicalRecords() {
        return medicalRecords;
    }

    public List<Prescription> getPrescriptions() {
        return prescriptions;
    }

    public List<Payment> getPayments() {
        return payments;
    }

    public List<Report> getReports() {
        return reports;
    }
}
