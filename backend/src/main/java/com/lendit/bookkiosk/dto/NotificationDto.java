package com.lendit.bookkiosk.dto;

import com.lendit.bookkiosk.model.EmailNotification;
import java.time.LocalDateTime;

public record NotificationDto(
        Long id,
        String type,
        String subject,
        String message,
        LocalDateTime createdAt,
        boolean readByUser
) {
    public static NotificationDto from(EmailNotification n) {
        return new NotificationDto(
                n.getId(),
                n.getType().name(),
                n.getSubject(),
                n.getMessage(),
                n.getCreatedAt(),
                n.isReadByUser()
        );
    }
}