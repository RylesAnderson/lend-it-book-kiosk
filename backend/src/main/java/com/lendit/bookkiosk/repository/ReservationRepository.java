package com.lendit.bookkiosk.repository;

import com.lendit.bookkiosk.model.Reservation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {
    List<Reservation> findByUserIdOrderByReservedDateDesc(Long userId);

    /** Find the oldest PENDING reservation for a given book — used to promote
     *  the next person in line when a book is returned. */
    Optional<Reservation> findFirstByBookIdAndStatusOrderByReservedDateAsc(
            Long bookId, Reservation.Status status);

    boolean existsByUserIdAndBookIdAndStatusIn(
            Long userId, Long bookId, List<Reservation.Status> statuses);
}