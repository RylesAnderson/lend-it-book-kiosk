package com.lendit.bookkiosk.service;

import com.lendit.bookkiosk.dto.LoanDto;
import com.lendit.bookkiosk.model.Book;
import com.lendit.bookkiosk.model.Loan;
import com.lendit.bookkiosk.model.User;
import com.lendit.bookkiosk.repository.BookRepository;
import com.lendit.bookkiosk.repository.LoanRepository;
import com.lendit.bookkiosk.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;

@Service
public class LoanService {

    private static final int LOAN_PERIOD_DAYS = 14;

    private final LoanRepository loanRepository;
    private final BookRepository bookRepository;
    private final UserRepository userRepository;

    public LoanService(LoanRepository loanRepository,
                       BookRepository bookRepository,
                       UserRepository userRepository) {
        this.loanRepository = loanRepository;
        this.bookRepository = bookRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public LoanDto borrowBook(Long userId, Long bookId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Book not found"));

        if (!book.isAvailable()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Book is not available");
        }

        LocalDate today = LocalDate.now();
        Loan loan = new Loan(user, book, today, today.plusDays(LOAN_PERIOD_DAYS));
        book.setAvailable(false);

        bookRepository.save(book);
        loan = loanRepository.save(loan);

        // Hook for EmailNotif use case — wire in an EmailService here later
        // emailService.sendLoanConfirmation(user, loan);

        return LoanDto.from(loan);
    }

    @Transactional
    public LoanDto returnBook(Long userId, Long loanId) {
        Loan loan = loanRepository.findById(loanId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Loan not found"));

        if (!loan.getUser().getId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your loan");
        }
        if (loan.getStatus() == Loan.Status.RETURNED) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Already returned");
        }

        loan.setReturnDate(LocalDate.now());
        loan.setStatus(Loan.Status.RETURNED);
        loan.getBook().setAvailable(true);

        bookRepository.save(loan.getBook());
        loanRepository.save(loan);

        return LoanDto.from(loan);
    }

    public List<LoanDto> getUserLoans(Long userId) {
        return loanRepository.findByUserIdOrderByBorrowDateDesc(userId)
                .stream().map(LoanDto::from).toList();
    }
}
