package com.meditrack.monolith.controller;

import com.meditrack.monolith.service.AppointmentService;

public class AppointmentController {
    private final AppointmentService appointmentService;

    public AppointmentController(AppointmentService appointmentService) {
        this.appointmentService = appointmentService;
    }

    public String createAppointment(String id, String patientId, String doctorId, String date) {
        return appointmentService.createAppointment(id, patientId, doctorId, date);
    }
}
