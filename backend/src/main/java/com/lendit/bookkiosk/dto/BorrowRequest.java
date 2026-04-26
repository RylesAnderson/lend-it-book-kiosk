package com.lendit.bookkiosk.dto;

import jakarta.validation.constraints.NotNull;

public record BorrowRequest(@NotNull Long bookId) {}
