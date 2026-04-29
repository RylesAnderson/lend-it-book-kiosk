package com.lendit.bookkiosk.service;

import com.lendit.bookkiosk.dto.NotificationDto;
import com.lendit.bookkiosk.model.EmailNotification;
import com.lendit.bookkiosk.model.User;
import com.lendit.bookkiosk.repository.NotificationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Centralized service for the EmailNotif use case.
 *
 * In dev, "sending" is a log line — but the notification record is always
 * persisted, so the in-app notifications panel works whether or not real
 * email delivery is configured. In production, replace the log line with
 * a real email client (Spring Mail / AWS SES / SendGrid). The persisted
 * record stays the same.
 */
@Service
public class NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);

    private final NotificationRepository repository;

    public NotificationService(NotificationRepository repository) {
        this.repository = repository;
    }

    /** Persist a notification AND attempt delivery. */
    public EmailNotification send(User recipient,
                                  EmailNotification.Type type,
                                  String subject,
                                  String message) {
        EmailNotification n = new EmailNotification(recipient, type, subject, message);
        n = repository.save(n);

        try {
            // PRODUCTION HOOK: replace this log statement with a real email client.
            // emailClient.send(recipient.getEmail(), subject, message);
            log.info("[NOTIF -> {}] {} | {}", recipient.getEmail(), subject, message);
            n.setSentAt(LocalDateTime.now());
            n.setDeliveryStatus(EmailNotification.DeliveryStatus.SENT);
        } catch (Exception ex) {
            log.warn("Failed to deliver notification id={}", n.getId(), ex);
            n.setDeliveryStatus(EmailNotification.DeliveryStatus.FAILED);
        }
        return repository.save(n);
    }

    /** All notifications for a user, newest first. */
    public List<NotificationDto> listForUser(Long userId) {
        return repository.findByRecipientIdOrderByCreatedAtDesc(userId).stream()
                .map(NotificationDto::from)
                .toList();
    }

    /** Unread count — used by the navbar bell badge. */
    public long unreadCount(Long userId) {
        return repository.countByRecipientIdAndReadByUserFalse(userId);
    }

    /** Mark one notification read. Verifies ownership first. */
    public void markRead(Long userId, Long notificationId) {
        EmailNotification n = repository.findById(notificationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Notification not found"));
        if (!n.getRecipient().getId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your notification");
        }
        if (!n.isReadByUser()) {
            n.setReadByUser(true);
            repository.save(n);
        }
    }

    /** Mark all of the user's notifications read in one go. */
    public void markAllRead(Long userId) {
        List<EmailNotification> list = repository.findByRecipientIdOrderByCreatedAtDesc(userId);
        for (EmailNotification n : list) {
            if (!n.isReadByUser()) {
                n.setReadByUser(true);
            }
        }
        repository.saveAll(list);
    }
}