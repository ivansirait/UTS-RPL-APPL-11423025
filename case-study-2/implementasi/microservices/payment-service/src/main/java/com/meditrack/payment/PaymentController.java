package com.meditrack.payment;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/payments")
public class PaymentController {

    @PostMapping("/process")
    public String processPayment(@RequestBody PaymentRequest request) {
        // Logic to process payment
        return "Payment processed for amount: " + request.getAmount() + " by patient: " + request.getPatientId();
    }

    @GetMapping("/{id}")
    public Payment getPayment(@PathVariable String id) {
        // Logic to get payment details
        return new Payment(id, "patient1", 50.0, "completed");
    }
}

class PaymentRequest {
    private String patientId;
    private double amount;

    public String getPatientId() { return patientId; }
    public double getAmount() { return amount; }
}

class Payment {
    private String id;
    private String patientId;
    private double amount;
    private String status;

    public Payment(String id, String patientId, double amount, String status) {
        this.id = id;
        this.patientId = patientId;
        this.amount = amount;
        this.status = status;
    }

    // Getters
    public String getId() { return id; }
    public String getPatientId() { return patientId; }
    public double getAmount() { return amount; }
    public String getStatus() { return status; }
}