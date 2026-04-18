package com.meditrack.monolith.model;

public class Prescription {
    private final String id;
    private final String medicalRecordId;
    private final String medicineName;

    public Prescription(String id, String medicalRecordId, String medicineName) {
        this.id = id;
        this.medicalRecordId = medicalRecordId;
        this.medicineName = medicineName;
    }

    public String getId() {
        return id;
    }

    public String getMedicalRecordId() {
        return medicalRecordId;
    }

    public String getMedicineName() {
        return medicineName;
    }
}
