package com.lendit.bookkiosk.model;

import jakarta.persistence.*;
import java.time.LocalDate;

/**
 * Holds a student's place in line for a book that is currently checked out.
 *
 * Mirrors the Reservation class from the UML class diagram:
 *   reserveID, reservedDate, status, cancelReservation()
 *
 * State machine:
 *   PENDING   — waiting for the book to be returned
 *   READY     — book is back; student has a 3-day pickup window
 *   FULFILLED — student picked it up (i.e. borrowed it)
 *   CANCELLED — student cancelled
 *   EXPIRED   — student didn't pick up in time
 */
@Entity
@Table(name = "reservations")
public class Reservation {

    public enum Status { PENDING, READY, FULFILLED, CANCELLED, EXPIRED }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(optional = false)
    @JoinColumn(name = "book_id")
    private Book book;

    @Column(nullable = false)
    private LocalDate reservedDate;

    /** When status flips to READY, the user has until this date to pick it up. */
    private LocalDate readyUntilDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status = Status.PENDING;

    public Reservation() {}

    public Reservation(User user, Book book, LocalDate reservedDate) {
        this.user = user;
        this.book = book;
        this.reservedDate = reservedDate;
    }

    public Long getId() { return id; }
    public User getUser() { return user; }
    public Book getBook() { return book; }
    public LocalDate getReservedDate() { return reservedDate; }
    public LocalDate getReadyUntilDate() { return readyUntilDate; }
    public void setReadyUntilDate(LocalDate readyUntilDate) { this.readyUntilDate = readyUntilDate; }
    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }
}