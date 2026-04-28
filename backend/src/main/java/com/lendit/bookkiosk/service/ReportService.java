package com.lendit.bookkiosk.service;

import com.lendit.bookkiosk.dto.ReportDto;
import com.lendit.bookkiosk.model.Book;
import com.lendit.bookkiosk.model.Loan;
import com.lendit.bookkiosk.repository.BookRepository;
import com.lendit.bookkiosk.repository.LoanRepository;
import com.lendit.bookkiosk.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ReportService {

    private final BookRepository bookRepository;
    private final UserRepository userRepository;
    private final LoanRepository loanRepository;

    public ReportService(BookRepository bookRepository,
                         UserRepository userRepository,
                         LoanRepository loanRepository) {
        this.bookRepository = bookRepository;
        this.userRepository = userRepository;
        this.loanRepository = loanRepository;
    }

    /**
     * Build a kiosk-wide summary report.
     * Note: this implementation pulls all loans into memory and aggregates in Java.
     * Fine for hundreds or low thousands of loans. For large datasets, push the
     * aggregation into the database with custom @Query methods.
     */
    public ReportDto generate() {
        List<Book> books = bookRepository.findAll();
        List<Loan> loans = loanRepository.findAll();
        long userCount = userRepository.count();

        long total = books.size();
        long available = books.stream().filter(Book::isAvailable).count();
        long checkedOut = total - available;

        LocalDate today = LocalDate.now();
        long active = loans.stream()
                .filter(l -> l.getStatus() == Loan.Status.ACTIVE)
                .count();
        long overdue = loans.stream()
                .filter(l -> l.getStatus() == Loan.Status.ACTIVE)
                .filter(l -> l.getDueDate().isBefore(today))
                .count();

        // Group loans by book and count, then take the top 5
        Map<Long, Long> borrowCounts = loans.stream()
                .collect(Collectors.groupingBy(l -> l.getBook().getId(), Collectors.counting()));

        List<ReportDto.PopularBookEntry> top5 = borrowCounts.entrySet().stream()
                .sorted(Map.Entry.<Long, Long>comparingByValue().reversed())
                .limit(5)
                .map(entry -> {
                    Book book = books.stream()
                            .filter(b -> b.getId().equals(entry.getKey()))
                            .findFirst()
                            .orElse(null);
                    if (book == null) return null;
                    return new ReportDto.PopularBookEntry(
                            book.getId(), book.getTitle(), book.getAuthor(), entry.getValue());
                })
                .filter(e -> e != null)
                .toList();

        return new ReportDto(
                total, available, checkedOut,
                userCount, active, overdue, loans.size(),
                top5
        );
    }
}
