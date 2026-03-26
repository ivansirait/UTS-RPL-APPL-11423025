package com.meditrack.appointment;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

@RestController
@RequestMapping("/appointments")
public class AppointmentController {

    private RestTemplate restTemplate = new RestTemplate();

    @PostMapping("/book")
    public String bookAppointment(@RequestBody AppointmentRequest request) {
        // Call Auth Service to verify user
        String authUrl = "http://auth-service:8080/auth/users/" + request.getPatientId();
        User user = restTemplate.getForObject(authUrl, User.class);
        if (user == null) {
            return "Patient not found";
        }

        // Logic to book appointment
        return "Appointment booked for patient: " + user.getUsername();
    }

    @GetMapping("/{id}")
    public Appointment getAppointment(@PathVariable String id) {
        // Logic to get appointment
        return new Appointment(id, "patient1", "doctor1", "2023-10-01");
    }
}

class AppointmentRequest {
    private String patientId;
    private String doctorId;
    private String date;

    public String getPatientId() { return patientId; }
    public String getDoctorId() { return doctorId; }
    public String getDate() { return date; }
}

class Appointment {
    private String id;
    private String patient;
    private String doctor;
    private String date;

    public Appointment(String id, String patient, String doctor, String date) {
        this.id = id;
        this.patient = patient;
        this.doctor = doctor;
        this.date = date;
    }

    // Getters
    public String getId() { return id; }
    public String getPatient() { return patient; }
    public String getDoctor() { return doctor; }
    public String getDate() { return date; }
}

class User {
    private String id;
    private String username;
    private String role;

    public User() {}

    // Getters
    public String getId() { return id; }
    public String getUsername() { return username; }
    public String getRole() { return role; }
}