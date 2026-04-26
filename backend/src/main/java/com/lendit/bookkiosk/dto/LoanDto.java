package com.lendit.bookkiosk.dto;

import com.lendit.bookkiosk.model.Loan;
import java.time.LocalDate;

public record LoanDto(
        Long id,
        Long bookId,
        String bookTitle,
        String bookAuthor,
        LocalDate borrowDate,
        LocalDate dueDate,
        LocalDate returnDate,
        String status
) {
    public static LoanDto from(Loan l) {
        return new LoanDto(
                l.getId(),
                l.getBook().getId(),
                l.getBook().getTitle(),
                l.getBook().getAuthor(),
                l.getBorrowDate(),
                l.getDueDate(),
                l.getReturnDate(),
                l.getStatus().name()
        );
    }
}
