package com.meditrack.monolith.service;

import com.meditrack.monolith.model.Report;
import com.meditrack.monolith.repository.AnalyticsRepository;

public class AnalyticsService {
    private final AnalyticsRepository analyticsRepository;
    private final AppointmentService appointmentService;
    private final PaymentService paymentService;

    public AnalyticsService(AnalyticsRepository analyticsRepository, AppointmentService appointmentService, PaymentService paymentService) {
        this.analyticsRepository = analyticsRepository;
        this.appointmentService = appointmentService;
        this.paymentService = paymentService;
    }

    public String generateSummary() {
        analyticsRepository.save(new Report("report-1", "summary", "Generated operational summary from shared data"));
        return "Analytics summary generated from shared database";
    }
}
