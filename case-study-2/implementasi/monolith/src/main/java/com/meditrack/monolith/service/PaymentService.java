package com.meditrack.monolith.service;

import com.meditrack.monolith.model.Appointment;
import com.meditrack.monolith.model.Payment;
import com.meditrack.monolith.repository.PaymentRepository;

public class PaymentService {
    private final PaymentRepository paymentRepository;
    private final AppointmentService appointmentService;

    public PaymentService(PaymentRepository paymentRepository, AppointmentService appointmentService) {
        this.paymentRepository = paymentRepository;
        this.appointmentService = appointmentService;
    }

    public String pay(String id, String appointmentId, double amount) {
        Appointment appointment = appointmentService.findAppointment(appointmentId);
        if (appointment == null) {
            return "Appointment not found";
        }

        paymentRepository.save(new Payment(id, appointmentId, amount, "PAID"));
        return "Payment successful for appointment: " + appointmentId;
    }
}
