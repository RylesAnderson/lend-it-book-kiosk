package com.lendit.bookkiosk.dto;

import jakarta.validation.constraints.NotNull;

public record CreateReservationRequest(@NotNull Long bookId) {}