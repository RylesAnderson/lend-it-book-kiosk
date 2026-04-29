package com.lendit.bookkiosk.controller;

import com.lendit.bookkiosk.dto.CreateDonationRequest;
import com.lendit.bookkiosk.dto.DonationDto;
import com.lendit.bookkiosk.model.User;
import com.lendit.bookkiosk.service.AuthService;
import com.lendit.bookkiosk.service.DonationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/donations")
public class DonationController {
    private final DonationService donationService;
    private final AuthService authService;


    public DonationController(DonationService donationService, AuthService authService) {
        this.donationService = donationService;
        this.authService = authService;
    }

    @PostMapping
    public ResponseEntity<DonationDto> submit(@Valid @RequestBody CreateDonationRequest req, @RequestHeader("Authorization") String auth) {
        Long userId = authService.validateToken(auth);
        DonationDto created = donationService.submit(userId, req);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
    @GetMapping("/mine")
    public List<DonationDto> mine(@RequestHeader("Authorization") String auth) {
        Long userId = authService.validateToken(auth);
        return donationService.myDonations(userId);
    }

    // ---- Staff endpoints ----

    @GetMapping("/pending")
    public List<DonationDto> pending(@RequestHeader("Authorization") String auth) {
        authService.requireRole(auth, User.Role.STAFF);
        return donationService.pendingReview();
    }

    @PostMapping("/{id}/accept")
    public DonationDto accept(@PathVariable Long id,
                              @RequestHeader("Authorization") String auth) {
        authService.requireRole(auth, User.Role.STAFF);
        return donationService.accept(id);
    }

    @PostMapping("/{id}/reject")
    public DonationDto reject(@PathVariable Long id,
                              @RequestHeader("Authorization") String auth) {
        authService.requireRole(auth, User.Role.STAFF);
        return donationService.reject(id);
    }
}