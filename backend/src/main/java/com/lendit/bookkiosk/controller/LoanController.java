package com.lendit.bookkiosk.controller;

import com.lendit.bookkiosk.dto.BorrowRequest;
import com.lendit.bookkiosk.dto.LoanDto;
import com.lendit.bookkiosk.service.AuthService;
import com.lendit.bookkiosk.service.LoanService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/loans")
public class LoanController {

    private final LoanService loanService;
    private final AuthService authService;

    public LoanController(LoanService loanService, AuthService authService) {
        this.loanService = loanService;
        this.authService = authService;
    }

    @GetMapping("/me")
    public List<LoanDto> myLoans(@RequestHeader("Authorization") String auth) {
        Long userId = authService.validateToken(auth);
        return loanService.getUserLoans(userId);
    }

    @PostMapping
    public LoanDto borrow(@Valid @RequestBody BorrowRequest req,
                          @RequestHeader("Authorization") String auth) {
        Long userId = authService.validateToken(auth);
        return loanService.borrowBook(userId, req.bookId());
    }

    @PostMapping("/{loanId}/return")
    public LoanDto returnBook(@PathVariable Long loanId,
                              @RequestHeader("Authorization") String auth) {
        Long userId = authService.validateToken(auth);
        return loanService.returnBook(userId, loanId);
    }
}
