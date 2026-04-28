package com.lendit.bookkiosk.controller;

import com.lendit.bookkiosk.dto.BookDto;
import com.lendit.bookkiosk.dto.CreateBookRequest;
import com.lendit.bookkiosk.model.User;
import com.lendit.bookkiosk.service.AuthService;
import com.lendit.bookkiosk.service.BookService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/books")
public class BookController {

    private final BookService bookService;
    private final AuthService authService;

    public BookController(BookService bookService, AuthService authService) {
        this.bookService = bookService;
        this.authService = authService;
    }

    // ---- Public endpoints (anyone can browse) ----

    @GetMapping
    public List<BookDto> list(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String genre,
            @RequestParam(required = false) Boolean availableOnly) {
        if (query == null && genre == null && availableOnly == null) {
            return bookService.listAll();
        }
        return bookService.search(query, genre, availableOnly);
    }

    @GetMapping("/{id}")
    public BookDto get(@PathVariable Long id) {
        return bookService.getById(id);
    }

    // ---- Staff-only endpoints ----

    @PostMapping
    public ResponseEntity<BookDto> create(@Valid @RequestBody CreateBookRequest req,
                                          @RequestHeader("Authorization") String auth) {
        authService.requireRole(auth, User.Role.STAFF);
        BookDto created = bookService.create(req);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id,
                                       @RequestHeader("Authorization") String auth) {
        authService.requireRole(auth, User.Role.STAFF);
        bookService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
