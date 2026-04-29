package com.lendit.bookkiosk.dto;

import com.lendit.bookkiosk.model.Donation;
import java.time.LocalDate;

public record DonationDto(
        Long id,
        String donorName,
        String title,
        String author,
        String isbn,
        String condition,
        String status,
        LocalDate donationDate
) {
    public static DonationDto from(Donation d) {
        return new DonationDto(
                d.getId(),
                d.getDonor().getName(),
                d.getTitle(),
                d.getAuthor(),
                d.getIsbn(),
                d.getCondition().name(),
                d.getStatus().name(),
                d.getDonationDate()
        );
    }
}