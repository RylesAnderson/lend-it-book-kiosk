package com.lendit.bookkiosk.controller;

import com.lendit.bookkiosk.dto.BookDto;
import com.lendit.bookkiosk.service.BookService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/books")
public class BookController {

    private final BookService bookService;

    public BookController(BookService bookService) {
        this.bookService = bookService;
    }

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
}
