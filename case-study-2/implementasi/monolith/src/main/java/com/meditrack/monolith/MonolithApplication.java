package com.meditrack.monolith;

import com.meditrack.monolith.config.DatabaseConnection;
import com.meditrack.monolith.controller.AnalyticsController;
import com.meditrack.monolith.controller.AppointmentController;
import com.meditrack.monolith.controller.EHRController;
import com.meditrack.monolith.controller.PharmacyController;
import com.meditrack.monolith.controller.PaymentController;
import com.meditrack.monolith.controller.UserController;
import com.meditrack.monolith.repository.AnalyticsRepository;
import com.meditrack.monolith.repository.AppointmentRepository;
import com.meditrack.monolith.repository.EHRRepository;
import com.meditrack.monolith.repository.PharmacyRepository;
import com.meditrack.monolith.repository.PaymentRepository;
import com.meditrack.monolith.repository.UserRepository;
import com.meditrack.monolith.service.AnalyticsService;
import com.meditrack.monolith.service.AppointmentService;
import com.meditrack.monolith.service.AuthService;
import com.meditrack.monolith.service.EHRService;
import com.meditrack.monolith.service.PharmacyService;
import com.meditrack.monolith.service.PaymentService;

public class MonolithApplication {
    public static void main(String[] args) {
        DatabaseConnection db = new DatabaseConnection();

        UserRepository userRepository = new UserRepository(db);
        AppointmentRepository appointmentRepository = new AppointmentRepository(db);
        EHRRepository ehrRepository = new EHRRepository(db);
        PharmacyRepository pharmacyRepository = new PharmacyRepository(db);
        PaymentRepository paymentRepository = new PaymentRepository(db);
        AnalyticsRepository analyticsRepository = new AnalyticsRepository(db);

        AuthService authService = new AuthService(userRepository);
        AppointmentService appointmentService = new AppointmentService(appointmentRepository, authService);
        EHRService ehrService = new EHRService(ehrRepository, appointmentService);
        PharmacyService pharmacyService = new PharmacyService(pharmacyRepository, ehrService);
        PaymentService paymentService = new PaymentService(paymentRepository, appointmentService);
        AnalyticsService analyticsService = new AnalyticsService(analyticsRepository, appointmentService, paymentService);

        UserController userController = new UserController(authService);
        AppointmentController appointmentController = new AppointmentController(appointmentService);
        EHRController ehrController = new EHRController(ehrService);
        PharmacyController pharmacyController = new PharmacyController(pharmacyService);
        PaymentController paymentController = new PaymentController(paymentService);
        AnalyticsController analyticsController = new AnalyticsController(analyticsService);

        userController.register("u-1", "patient1", "patient1@mail.com", "patient");
        userController.register("u-2", "doctor1", "doctor1@mail.com", "doctor");

        System.out.println(userController.login("patient1", "secret"));
        System.out.println(appointmentController.createAppointment("a-1", "u-1", "u-2", "2026-04-18"));
        System.out.println(ehrController.createRecord("mr-1", "a-1", "Consultation completed"));
        System.out.println(pharmacyController.createPrescription("p-1", "mr-1", "Amoxicillin 500mg"));
        System.out.println(paymentController.pay("pay-1", "a-1", 150000));
        System.out.println(analyticsController.generateSummary());
    }
}
