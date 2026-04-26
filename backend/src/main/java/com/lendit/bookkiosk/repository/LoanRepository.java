package com.lendit.bookkiosk.repository;

import com.lendit.bookkiosk.model.Loan;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LoanRepository extends JpaRepository<Loan, Long> {
    List<Loan> findByUserIdOrderByBorrowDateDesc(Long userId);
    List<Loan> findByUserIdAndStatus(Long userId, Loan.Status status);
}
