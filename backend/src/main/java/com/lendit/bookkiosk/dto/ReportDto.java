package com.lendit.bookkiosk.dto;

import java.util.List;

public record ReportDto(
        long totalBooks,
        long availableBooks,
        long checkedOutBooks,
        long totalUsers,
        long activeLoans,
        long overdueLoans,
        long totalLoansAllTime,
        List<PopularBookEntry> mostBorrowedBooks
) {
    public record PopularBookEntry(Long bookId, String title, String author, long borrowCount) {}
}
