package com.lendit.bookkiosk.service;

import com.lendit.bookkiosk.dto.BookDto;
import com.lendit.bookkiosk.dto.CreateBookRequest;
import com.lendit.bookkiosk.model.Book;
import com.lendit.bookkiosk.model.Loan;
import com.lendit.bookkiosk.repository.BookRepository;
import com.lendit.bookkiosk.repository.LoanRepository;
import jakarta.transaction.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class BookService {

    private final BookRepository bookRepository;
    private final LoanRepository loanRepository;

    public BookService(BookRepository bookRepository, LoanRepository loanRepository) {
        this.bookRepository = bookRepository;
        this.loanRepository = loanRepository;
    }

    public List<BookDto> listAll() {
        return bookRepository.findAll().stream().map(BookDto::from).toList();
    }

    public List<BookDto> search(String query, String genre, Boolean availableOnly) {
        List<Book> results;
        if (query != null && !query.isBlank()) {
            results = bookRepository.findByTitleContainingIgnoreCaseOrAuthorContainingIgnoreCase(query, query);
        } else if (genre != null && !genre.isBlank()) {
            results = bookRepository.findByGenreIgnoreCase(genre);
        } else if (Boolean.TRUE.equals(availableOnly)) {
            results = bookRepository.findByAvailableTrue();
        } else {
            results = bookRepository.findAll();
        }
        return results.stream().map(BookDto::from).toList();
    }

    public BookDto getById(Long id) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Book not found"));
        return BookDto.from(book);
    }

    /**
     * Add a new book to the catalog. Staff/admin only.
     * New books are marked as available by default.
     */
    public BookDto create(CreateBookRequest req) {
        Book book = new Book(
                req.title().trim(),
                req.author().trim(),
                req.isbn() == null ? null : req.isbn().trim(),
                req.genre() == null ? null : req.genre().trim(),
                req.description() == null ? null : req.description().trim(),
                true
        );
        book = bookRepository.save(book);
        return BookDto.from(book);
    }

    /**
     * Remove a book from the catalog. Staff/admin only.
     * Refuses to delete books with active loans to keep loan history consistent.
     */
    @Transactional
    public void delete(Long bookId) {
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Book not found"));

        // Check for any active loans referencing this book.
        // Allowing deletion would orphan the loans table.
        boolean hasActiveLoans = loanRepository.findAll().stream()
                .anyMatch(l -> l.getBook().getId().equals(bookId)
                        && l.getStatus() == Loan.Status.ACTIVE);

        if (hasActiveLoans) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Cannot delete a book with active loans. Wait until it's returned.");
        }

        bookRepository.delete(book);
    }
}
