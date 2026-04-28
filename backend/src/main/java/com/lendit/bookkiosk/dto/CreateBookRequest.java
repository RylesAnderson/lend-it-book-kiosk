package com.lendit.bookkiosk.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateBookRequest(
        @NotBlank @Size(max = 255) String title,
        @NotBlank @Size(max = 255) String author,
        @Size(max = 20) String isbn,
        @Size(max = 100) String genre,
        @Size(max = 1000) String description
) {}
