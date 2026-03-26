package com.meditrack.ehr;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/ehr")
public class EHRController {

    @PostMapping("/records")
    public String addRecord(@RequestBody MedicalRecord record) {
        // Logic to add medical record
        return "Medical record added for patient: " + record.getPatientId();
    }

    @GetMapping("/records/{patientId}")
    public MedicalRecord getRecord(@PathVariable String patientId) {
        // Logic to get medical record
        return new MedicalRecord(patientId, "Sample medical record");
    }
}

class MedicalRecord {
    private String patientId;
    private String record;

    public MedicalRecord(String patientId, String record) {
        this.patientId = patientId;
        this.record = record;
    }

    // Getters
    public String getPatientId() { return patientId; }
    public String getRecord() { return record; }
}