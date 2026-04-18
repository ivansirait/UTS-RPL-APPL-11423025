package com.meditrack.monolith.model;

public class MedicalRecord {
    private final String id;
    private final String appointmentId;
    private final String notes;

    public MedicalRecord(String id, String appointmentId, String notes) {
        this.id = id;
        this.appointmentId = appointmentId;
        this.notes = notes;
    }

    public String getId() {
        return id;
    }

    public String getAppointmentId() {
        return appointmentId;
    }

    public String getNotes() {
        return notes;
    }
}
