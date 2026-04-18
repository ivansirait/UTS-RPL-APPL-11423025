package com.meditrack.monolith.service;

import com.meditrack.monolith.model.Appointment;
import com.meditrack.monolith.model.MedicalRecord;
import com.meditrack.monolith.repository.EHRRepository;

public class EHRService {
    private final EHRRepository ehrRepository;
    private final AppointmentService appointmentService;

    public EHRService(EHRRepository ehrRepository, AppointmentService appointmentService) {
        this.ehrRepository = ehrRepository;
        this.appointmentService = appointmentService;
    }

    public String createRecord(String id, String appointmentId, String notes) {
        Appointment appointment = appointmentService.findAppointment(appointmentId);
        if (appointment == null) {
            return "Appointment not found";
        }

        ehrRepository.save(new MedicalRecord(id, appointmentId, notes));
        return "Medical record created for appointment: " + appointmentId;
    }
}
