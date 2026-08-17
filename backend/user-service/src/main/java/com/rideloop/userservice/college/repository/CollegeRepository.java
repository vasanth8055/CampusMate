package com.rideloop.userservice.college.repository;

import com.rideloop.userservice.college.entity.College;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CollegeRepository
        extends JpaRepository<College, UUID> {

    Optional<College> findByEmailDomainAndActiveTrue(
            String emailDomain
    );

    Optional<College> findByEmailDomain(
            String emailDomain
    );

    Optional<College> findByShortName(
            String shortName
    );

    List<College> findByActiveTrue();
}