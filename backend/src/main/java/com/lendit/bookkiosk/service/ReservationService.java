package com.lendit.bookkiosk.service;

import com.lendit.bookkiosk.dto.ReservationDto;
import com.lendit.bookkiosk.model.Book;
import com.lendit.bookkiosk.model.EmailNotification;
import com.lendit.bookkiosk.model.Reservation;
import com.lendit.bookkiosk.model.User;
import com.lendit.bookkiosk.repository.BookRepository;
import com.lendit.bookkiosk.repository.ReservationRepository;
import com.lendit.bookkiosk.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * Implements the ReserveBook use case.
 *
 * Reservations only make sense when a book is currently checked out — if it's
 * available, the student should just borrow it directly. When a book is
 * returned, LoanService asks this service whether anyone has been waiting;
 * if so, the oldest pending reservation is promoted to READY and the user
 * is notified.
 */
@Service
public class ReservationService {

    /** When a reservation becomes READY, the user has this many days to pick it up. */
    private static final int PICKUP_WINDOW_DAYS = 3;

    private final ReservationRepository reservationRepository;
    private final BookRepository bookRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public ReservationService(ReservationRepository reservationRepository,
                              BookRepository bookRepository,
                              UserRepository userRepository,
                              NotificationService notificationService) {
        this.reservationRepository = reservationRepository;
        this.bookRepository = bookRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    @Transactional
    public ReservationDto reserve(Long userId, Long bookId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Book not found"));

        if (book.isAvailable()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "This book is available now — borrow it directly instead of reserving.");
        }

        boolean alreadyHas = reservationRepository.existsByUserIdAndBookIdAndStatusIn(
                userId, bookId, List.of(Reservation.Status.PENDING, Reservation.Status.READY));
        if (alreadyHas) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "You already have an active reservation for this book.");
        }

        Reservation r = new Reservation(user, book, LocalDate.now());
        r = reservationRepository.save(r);

        notificationService.send(user,
                EmailNotification.Type.RESERVATION_CREATED,
                "Reservation created: " + book.getTitle(),
                "You're in line for '" + book.getTitle() + "'. " +
                        "We'll email you when it's ready to pick up.");

        return ReservationDto.from(r);
    }

    /**
     * Called by LoanService.returnBook when a book comes back. If anyone has
     * a PENDING reservation on that book, promote the oldest one to READY,
     * keep the book unavailable (it's now reserved-for-pickup, not free), and
     * notify the user.
     *
     * Returns true if a reservation was promoted (so LoanService knows to
     * keep the book unavailable).
     */
    @Transactional
    public boolean promoteNextReservationIfAny(Book book) {
        Optional<Reservation> next = reservationRepository
                .findFirstByBookIdAndStatusOrderByReservedDateAsc(book.getId(), Reservation.Status.PENDING);
        if (next.isEmpty()) return false;

        Reservation r = next.get();
        r.setStatus(Reservation.Status.READY);
        r.setReadyUntilDate(LocalDate.now().plusDays(PICKUP_WINDOW_DAYS));
        reservationRepository.save(r);

        notificationService.send(r.getUser(),
                EmailNotification.Type.RESERVATION_READY,
                "Your reservation is ready: " + book.getTitle(),
                "'" + book.getTitle() + "' is ready for you to pick up at the kiosk. " +
                        "Pick it up by " + r.getReadyUntilDate() + " or your reservation will expire.");
        return true;
    }

    @Transactional
    public void cancel(Long userId, Long reservationId) {
        Reservation r = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Reservation not found"));
        if (!r.getUser().getId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your reservation");
        }
        if (r.getStatus() != Reservation.Status.PENDING && r.getStatus() != Reservation.Status.READY) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "This reservation can no longer be cancelled.");
        }
        r.setStatus(Reservation.Status.CANCELLED);
        reservationRepository.save(r);
    }

    public List<ReservationDto> getUserReservations(Long userId) {
        return reservationRepository.findByUserIdOrderByReservedDateDesc(userId).stream()
                .map(ReservationDto::from)
                .toList();
    }
}