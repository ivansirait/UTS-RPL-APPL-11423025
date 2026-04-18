package com.meditrack.monolith.controller;

import com.meditrack.monolith.service.PaymentService;

public class PaymentController {
    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    public String pay(String id, String appointmentId, double amount) {
        return paymentService.pay(id, appointmentId, amount);
    }
}
