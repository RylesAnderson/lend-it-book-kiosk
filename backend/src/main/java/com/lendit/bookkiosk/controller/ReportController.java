package com.lendit.bookkiosk.controller;

import com.lendit.bookkiosk.dto.ReportDto;
import com.lendit.bookkiosk.model.User;
import com.lendit.bookkiosk.service.AuthService;
import com.lendit.bookkiosk.service.ReportService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final ReportService reportService;
    private final AuthService authService;

    public ReportController(ReportService reportService, AuthService authService) {
        this.reportService = reportService;
        this.authService = authService;
    }

    /**
     * Kiosk-wide summary report. Admin only.
     */
    @GetMapping("/summary")
    public ReportDto summary(@RequestHeader("Authorization") String auth) {
        authService.requireRole(auth, User.Role.ADMIN);
        return reportService.generate();
    }
}
