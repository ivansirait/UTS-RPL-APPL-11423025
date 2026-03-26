package com.meditrack.analytics;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/analytics")
public class AnalyticsController {

    @GetMapping("/appointments/count")
    public int getAppointmentCount() {
        // Logic to get appointment count from database
        return 150; // Sample data
    }

    @GetMapping("/payments/total")
    public double getTotalPayments() {
        // Logic to get total payments
        return 5000.0; // Sample data
    }
}