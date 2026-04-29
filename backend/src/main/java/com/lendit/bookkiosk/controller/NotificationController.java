package com.lendit.bookkiosk.controller;

import com.lendit.bookkiosk.dto.NotificationDto;
import com.lendit.bookkiosk.service.AuthService;
import com.lendit.bookkiosk.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;
    private final AuthService authService;

    public NotificationController(NotificationService notificationService, AuthService authService) {
        this.notificationService = notificationService;
        this.authService = authService;
    }

    @GetMapping
    public List<NotificationDto> list(@RequestHeader("Authorization") String auth) {
        Long userId = authService.validateToken(auth);
        return notificationService.listForUser(userId);
    }

    @GetMapping("/unread-count")
    public Map<String, Long> unreadCount(@RequestHeader("Authorization") String auth) {
        Long userId = authService.validateToken(auth);
        return Map.of("count", notificationService.unreadCount(userId));
    }

    @PostMapping("/{id}/read")
    public ResponseEntity<Void> markRead(@PathVariable Long id,
                                         @RequestHeader("Authorization") String auth) {
        Long userId = authService.validateToken(auth);
        notificationService.markRead(userId, id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/read-all")
    public ResponseEntity<Void> markAllRead(@RequestHeader("Authorization") String auth) {
        Long userId = authService.validateToken(auth);
        notificationService.markAllRead(userId);
        return ResponseEntity.noContent().build();
    }
}