package com.lendit.bookkiosk.dto;

import com.lendit.bookkiosk.model.Reservation;
import java.time.LocalDate;

public record ReservationDto(
        Long id,
        Long bookId,
        String bookTitle,
        String bookAuthor,
        LocalDate reservedDate,
        LocalDate readyUntilDate,
        String status
) {
    public static ReservationDto from(Reservation r) {
        return new ReservationDto(
                r.getId(),
                r.getBook().getId(),
                r.getBook().getTitle(),
                r.getBook().getAuthor(),
                r.getReservedDate(),
                r.getReadyUntilDate(),
                r.getStatus().name()
        );
    }
}