package com.meditrack.monolith.model;

public class Payment {
    private final String id;
    private final String appointmentId;
    private final double amount;
    private final String status;

    public Payment(String id, String appointmentId, double amount, String status) {
        this.id = id;
        this.appointmentId = appointmentId;
        this.amount = amount;
        this.status = status;
    }

    public String getId() {
        return id;
    }

    public String getAppointmentId() {
        return appointmentId;
    }

    public double getAmount() {
        return amount;
    }

    public String getStatus() {
        return status;
    }
}
