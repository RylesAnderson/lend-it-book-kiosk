package com.lendit.bookkiosk.dto;

import com.lendit.bookkiosk.model.Donation;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateDonationRequest(
        @NotBlank @Size(max = 255) String title,
        @NotBlank @Size(max = 255) String author,
        @Size(max = 20) String isbn,
        @NotNull Donation.Condition condition
) {}