package com.lendit.bookkiosk.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * A persisted record of an email notification sent (or queued) to a user.
 *
 * Mirrors the EmailNotification class from the UML diagram:
 *   notifID, recipient, message, sentDate, sendEmail()
 *
 * Persisting every notification gives us:
 *   1. An audit trail ("did the system actually email this user?")
 *   2. An in-app inbox the user can scroll through, even if they didn't
 *      receive (or read) the email.
 *
 * In dev, NotificationService just logs the message. In production,
 * swap in a real SMTP / SES / SendGrid client without changing the
 * shape of the data.
 */
@Entity
@Table(name = "notifications")
public class EmailNotification {

    public enum Type {
        LOAN_CONFIRM,
        RETURN_CONFIRM,
        DUE_REMINDER,
        OVERDUE,
        RESERVATION_CREATED,
        RESERVATION_READY,
        DONATION_RECEIVED,
        DONATION_ACCEPTED,
        DONATION_REJECTED
    }

    public enum DeliveryStatus { PENDING, SENT, FAILED }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "user_id")
    private User recipient;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Type type;

    @Column(nullable = false)
    private String subject;

    @Column(nullable = false, length = 2000)
    private String message;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    private LocalDateTime sentAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DeliveryStatus deliveryStatus = DeliveryStatus.PENDING;

    /** Has the user opened this in their notification panel yet? */
    @Column(nullable = false)
    private boolean readByUser = false;

    public EmailNotification() {}

    public EmailNotification(User recipient, Type type, String subject, String message) {
        this.recipient = recipient;
        this.type = type;
        this.subject = subject;
        this.message = message;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public User getRecipient() { return recipient; }
    public Type getType() { return type; }
    public String getSubject() { return subject; }
    public String getMessage() { return message; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getSentAt() { return sentAt; }
    public void setSentAt(LocalDateTime sentAt) { this.sentAt = sentAt; }
    public DeliveryStatus getDeliveryStatus() { return deliveryStatus; }
    public void setDeliveryStatus(DeliveryStatus deliveryStatus) { this.deliveryStatus = deliveryStatus; }
    public boolean isReadByUser() { return readByUser; }
    public void setReadByUser(boolean readByUser) { this.readByUser = readByUser; }
}