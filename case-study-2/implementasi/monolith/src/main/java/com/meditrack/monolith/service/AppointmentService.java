package com.meditrack.monolith.service;

import com.meditrack.monolith.model.Appointment;
import com.meditrack.monolith.model.User;
import com.meditrack.monolith.repository.AppointmentRepository;

public class AppointmentService {
    private final AppointmentRepository appointmentRepository;
    private final AuthService authService;

    public AppointmentService(AppointmentRepository appointmentRepository, AuthService authService) {
        this.appointmentRepository = appointmentRepository;
        this.authService = authService;
    }

    public String createAppointment(String id, String patientId, String doctorId, String date) {
        User patient = authService.findUser(patientId);
        if (patient == null) {
            return "Patient not found";
        }

        appointmentRepository.save(new Appointment(id, patientId, doctorId, date));
        return "Appointment booked for patient: " + patient.getUsername();
    }

    public Appointment findAppointment(String id) {
        return appointmentRepository.findById(id).orElse(null);
    }
}
