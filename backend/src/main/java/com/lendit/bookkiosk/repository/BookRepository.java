package com.lendit.bookkiosk.repository;

import com.lendit.bookkiosk.model.Book;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BookRepository extends JpaRepository<Book, Long> {

    // Spring Data JPA generates queries from method names
    List<Book> findByTitleContainingIgnoreCaseOrAuthorContainingIgnoreCase(String title, String author);
    List<Book> findByGenreIgnoreCase(String genre);
    List<Book> findByAvailableTrue();
}
