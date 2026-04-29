package com.lendit.bookkiosk.repository;

import com.lendit.bookkiosk.model.EmailNotification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository extends JpaRepository<EmailNotification, Long> {
    List<EmailNotification> findByRecipientIdOrderByCreatedAtDesc(Long userId);
    long countByRecipientIdAndReadByUserFalse(Long userId);
}