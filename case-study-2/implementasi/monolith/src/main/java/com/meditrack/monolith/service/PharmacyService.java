package com.meditrack.monolith.service;

import com.meditrack.monolith.model.Prescription;
import com.meditrack.monolith.repository.PharmacyRepository;

public class PharmacyService {
    private final PharmacyRepository pharmacyRepository;
    private final EHRService ehrService;

    public PharmacyService(PharmacyRepository pharmacyRepository, EHRService ehrService) {
        this.pharmacyRepository = pharmacyRepository;
        this.ehrService = ehrService;
    }

    public String createPrescription(String id, String medicalRecordId, String medicineName) {
        pharmacyRepository.save(new Prescription(id, medicalRecordId, medicineName));
        return "Prescription created: " + medicineName;
    }
}
