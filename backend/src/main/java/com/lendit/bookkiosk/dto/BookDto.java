package com.lendit.bookkiosk.dto;

import com.lendit.bookkiosk.model.Book;

public record BookDto(
        Long id,
        String title,
        String author,
        String isbn,
        String genre,
        String description,
        boolean available
) {
    public static BookDto from(Book b) {
        return new BookDto(b.getId(), b.getTitle(), b.getAuthor(),
                b.getIsbn(), b.getGenre(), b.getDescription(), b.isAvailable());
    }
}
