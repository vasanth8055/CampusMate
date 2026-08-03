package com.rideloop.userservice.college.config;

import com.rideloop.userservice.college.entity.College;
import com.rideloop.userservice.college.repository.CollegeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class CollegeSeeder implements CommandLineRunner {

    private final CollegeRepository collegeRepository;

    @Override
    public void run(String... args) {

        if (collegeRepository.count() == 0) {

            collegeRepository.save(
                    College.builder()
                            .name("Velagapudi Ramakrishna Siddhartha Engineering College")
                            .shortName("VRSEC")
                            .emailDomain("vrsec.ac.in")
                            .active(true)
                            .build()
            );
        }
    }
}