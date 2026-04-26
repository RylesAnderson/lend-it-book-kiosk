package com.lendit.bookkiosk.service;

import com.lendit.bookkiosk.dto.BookDto;
import com.lendit.bookkiosk.model.Book;
import com.lendit.bookkiosk.repository.BookRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class BookService {

    private final BookRepository bookRepository;

    public BookService(BookRepository bookRepository) {
        this.bookRepository = bookRepository;
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
}
