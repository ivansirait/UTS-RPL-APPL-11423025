package com.meditrack.pharmacy;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/pharmacy")
public class PharmacyController {

    @PostMapping("/prescriptions")
    public String dispenseMedication(@RequestBody Prescription prescription) {
        // Logic to dispense medication
        return "Medication dispensed: " + prescription.getMedication() + " for patient: " + prescription.getPatientId();
    }

    @GetMapping("/medications")
    public String[] getMedications() {
        // Logic to get available medications
        return new String[]{"Paracetamol", "Ibuprofen", "Aspirin"};
    }
}

class Prescription {
    private String patientId;
    private String medication;

    public String getPatientId() { return patientId; }
    public String getMedication() { return medication; }
}