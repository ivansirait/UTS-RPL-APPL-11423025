package com.meditrack.monolith.controller;

import com.meditrack.monolith.service.EHRService;

public class EHRController {
    private final EHRService ehrService;

    public EHRController(EHRService ehrService) {
        this.ehrService = ehrService;
    }

    public String createRecord(String id, String appointmentId, String notes) {
        return ehrService.createRecord(id, appointmentId, notes);
    }
}
