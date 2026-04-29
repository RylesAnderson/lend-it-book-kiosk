package com.lendit.bookkiosk.service;

import com.lendit.bookkiosk.dto.CreateDonationRequest;
import com.lendit.bookkiosk.dto.DonationDto;
import com.lendit.bookkiosk.model.Book;
import com.lendit.bookkiosk.model.Donation;
import com.lendit.bookkiosk.model.EmailNotification;
import com.lendit.bookkiosk.model.User;
import com.lendit.bookkiosk.repository.BookRepository;
import com.lendit.bookkiosk.repository.DonationRepository;
import com.lendit.bookkiosk.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

/**
 * Implements the DonateBook use case.
 *
 * Donations are submitted by students and stay in PENDING_REVIEW until staff
 * either accepts (which adds a Book to the catalog) or rejects them. Each
 * outcome triggers an email notification to the donor.
 */
@Service
public class DonationService {

    private final DonationRepository donationRepository;
    private final BookRepository bookRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public DonationService(DonationRepository donationRepository,
                           BookRepository bookRepository,
                           UserRepository userRepository,
                           NotificationService notificationService) {
        this.donationRepository = donationRepository;
        this.bookRepository = bookRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    @Transactional
    public DonationDto submit(Long userId, CreateDonationRequest req) {
        User donor = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        Donation d = new Donation(
                donor,
                req.title().trim(),
                req.author().trim(),
                req.isbn() == null ? null : req.isbn().trim(),
                req.condition()
        );
        d = donationRepository.save(d);

        notificationService.send(donor,
                EmailNotification.Type.DONATION_RECEIVED,
                "Thanks for your donation: " + d.getTitle(),
                "We received your donation of '" + d.getTitle() + "'. " +
                        "Library staff will review it and decide whether to add it to the catalog.");

        return DonationDto.from(d);
    }

    public List<DonationDto> myDonations(Long userId) {
        return donationRepository.findByDonorIdOrderByDonationDateDesc(userId).stream()
                .map(DonationDto::from)
                .toList();
    }

    /** Staff: list all donations awaiting review, oldest first. */
    public List<DonationDto> pendingReview() {
        return donationRepository.findByStatusOrderByDonationDateAsc(Donation.Status.PENDING_REVIEW)
                .stream().map(DonationDto::from).toList();
    }

    /** Staff: accept a donation, add it to the catalog, notify the donor. */
    @Transactional
    public DonationDto accept(Long donationId) {
        Donation d = mustBePending(donationId);

        Book book = new Book(
                d.getTitle(),
                d.getAuthor(),
                d.getIsbn(),
                null, // genre — staff can edit later
                "Donated by " + d.getDonor().getName(),
                true
        );
        bookRepository.save(book);

        d.setStatus(Donation.Status.ACCEPTED);
        donationRepository.save(d);

        notificationService.send(d.getDonor(),
                EmailNotification.Type.DONATION_ACCEPTED,
                "Donation accepted: " + d.getTitle(),
                "Your donation of '" + d.getTitle() + "' has been added to the catalog. Thanks!");

        return DonationDto.from(d);
    }

    /** Staff: reject a donation and notify the donor. */
    @Transactional
    public DonationDto reject(Long donationId) {
        Donation d = mustBePending(donationId);
        d.setStatus(Donation.Status.REJECTED);
        donationRepository.save(d);

        notificationService.send(d.getDonor(),
                EmailNotification.Type.DONATION_REJECTED,
                "Donation could not be accepted: " + d.getTitle(),
                "Unfortunately we couldn't add '" + d.getTitle() + "' to the catalog. " +
                        "You can pick it up at the front desk.");
        return DonationDto.from(d);
    }

    private Donation mustBePending(Long id) {
        Donation d = donationRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Donation not found"));
        if (d.getStatus() != Donation.Status.PENDING_REVIEW) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "This donation has already been " + d.getStatus().name().toLowerCase() + ".");
        }
        return d;
    }
}