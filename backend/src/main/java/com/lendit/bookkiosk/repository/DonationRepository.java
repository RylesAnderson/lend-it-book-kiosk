package com.lendit.bookkiosk.repository;

import com.lendit.bookkiosk.model.Donation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DonationRepository extends JpaRepository<Donation, Long> {
    List<Donation> findByDonorIdOrderByDonationDateDesc(Long donorId);
    List<Donation> findByStatusOrderByDonationDateAsc(Donation.Status status);
}