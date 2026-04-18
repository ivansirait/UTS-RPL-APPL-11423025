package com.meditrack.monolith.controller;

import com.meditrack.monolith.service.AnalyticsService;

public class AnalyticsController {
    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    public String generateSummary() {
        return analyticsService.generateSummary();
    }
}
