package com.lendit.bookkiosk.controller;

import com.lendit.bookkiosk.dto.AuthResponse;
import com.lendit.bookkiosk.dto.LoginRequest;
import com.lendit.bookkiosk.dto.RegisterRequest;
import com.lendit.bookkiosk.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public AuthResponse register(@Valid @RequestBody RegisterRequest req) {
        return authService.register(req);
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest req) {
        return authService.login(req);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@RequestHeader(value = "Authorization", required = false) String auth) {
        authService.logout(auth);
        return ResponseEntity.noContent().build();
    }
}
