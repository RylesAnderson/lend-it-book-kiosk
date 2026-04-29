package com.lendit.bookkiosk.controller;

import com.lendit.bookkiosk.dto.CreateReservationRequest;
import com.lendit.bookkiosk.dto.ReservationDto;
import com.lendit.bookkiosk.service.AuthService;
import com.lendit.bookkiosk.service.ReservationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reservations")
public class ReservationController {

    private final ReservationService reservationService;
    private final AuthService authService;

    public ReservationController(ReservationService reservationService, AuthService authService) {
        this.reservationService = reservationService;
        this.authService = authService;
    }

    @GetMapping("/me")
    public List<ReservationDto> mine(@RequestHeader("Authorization") String auth) {
        Long userId = authService.validateToken(auth);
        return reservationService.getUserReservations(userId);
    }

    @PostMapping
    public ResponseEntity<ReservationDto> create(@Valid @RequestBody CreateReservationRequest req,
                                                 @RequestHeader("Authorization") String auth) {
        Long userId = authService.validateToken(auth);
        ReservationDto r = reservationService.reserve(userId, req.bookId());
        return ResponseEntity.status(HttpStatus.CREATED).body(r);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> cancel(@PathVariable Long id,
                                       @RequestHeader("Authorization") String auth) {
        Long userId = authService.validateToken(auth);
        reservationService.cancel(userId, id);
        return ResponseEntity.noContent().build();
    }
}