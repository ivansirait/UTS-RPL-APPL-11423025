package com.meditrack.main;

import com.meditrack.user.UserService;
import com.meditrack.appointment.AppointmentService;
import com.meditrack.ehr.EHRService;
import com.meditrack.pharmacy.PharmacyService;
import com.meditrack.analytics.AnalyticsService;
import com.meditrack.payment.PaymentService;
import java.sql.SQLException;

public class MainApplication {
    public static void main(String[] args) {
        UserService userService = new UserService();
        AppointmentService appointmentService = new AppointmentService();
        EHRService ehrService = new EHRService();
        PharmacyService pharmacyService = new PharmacyService();
        AnalyticsService analyticsService = new AnalyticsService();
        PaymentService paymentService = new PaymentService();

        try {
            // Simulate user registration
            userService.registerUser("patient1", "pass", "patient");

            // Book appointment
            appointmentService.bookAppointment("patient1", "doctor1", "2023-10-01");

            // Add medical record
            ehrService.addMedicalRecord("patient1", "Diagnosis: Flu");

            // Dispense medication
            pharmacyService.dispenseMedication("patient1", "Paracetamol");

            // Process payment
            paymentService.processPayment("patient1", 50.0);

            // Get analytics
            int count = analyticsService.getAppointmentCount();
            System.out.println("Total appointments: " + count);

        } catch (SQLException e) {
            e.printStackTrace();
        }
    }
}