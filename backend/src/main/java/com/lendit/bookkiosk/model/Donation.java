package com.lendit.bookkiosk.model;

import jakarta.persistence.*;
import java.time.LocalDate;

/**
 * Records a book donation made by a student.
 *
 * Mirrors the Donation class from the UML class diagram:
 *   donationID, donationDate, condition, status
 *
 * Donations are NOT automatically added to the catalog. Library staff
 * reviews each donation and either accepts (creating a Book) or rejects
 * it. This audit trail matters because real libraries get donations
 * they can't accept (poor condition, duplicates, off-topic, etc.).
 */
@Entity
@Table(name = "donations")
public class Donation {

    public enum Condition { NEW, GOOD, FAIR, POOR }
    public enum Status { PENDING_REVIEW, ACCEPTED, REJECTED }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** The student who donated the book. */
    @ManyToOne(optional = false)
    @JoinColumn(name = "donor_id")
    private User donor;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String author;

    private String isbn;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Condition condition;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status = Status.PENDING_REVIEW;

    @Column(nullable = false)
    private LocalDate donationDate;

    public Donation() {}

    public Donation(User donor, String title, String author, String isbn, Condition condition) {
        this.donor = donor;
        this.title = title;
        this.author = author;
        this.isbn = isbn;
        this.condition = condition;
        this.donationDate = LocalDate.now();
    }

    public Long getId() { return id; }
    public User getDonor() { return donor; }
    public String getTitle() { return title; }
    public String getAuthor() { return author; }
    public String getIsbn() { return isbn; }
    public Condition getCondition() { return condition; }
    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }
    public LocalDate getDonationDate() { return donationDate; }
}