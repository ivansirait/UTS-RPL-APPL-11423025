package com.meditrack.monolith.controller;

import com.meditrack.monolith.service.PharmacyService;

public class PharmacyController {
    private final PharmacyService pharmacyService;

    public PharmacyController(PharmacyService pharmacyService) {
        this.pharmacyService = pharmacyService;
    }

    public String createPrescription(String id, String medicalRecordId, String medicineName) {
        return pharmacyService.createPrescription(id, medicalRecordId, medicineName);
    }
}
