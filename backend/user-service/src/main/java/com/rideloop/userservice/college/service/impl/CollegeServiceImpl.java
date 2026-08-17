package com.rideloop.userservice.college.service.impl;

import com.rideloop.userservice.college.dto.response.CollegeResponse;
import com.rideloop.userservice.college.entity.College;
import com.rideloop.userservice.college.exception.CollegeNotSupportedException;
import com.rideloop.userservice.college.mapper.CollegeMapper;
import com.rideloop.userservice.college.repository.CollegeRepository;
import com.rideloop.userservice.college.service.interfaces.CollegeService;
import com.rideloop.userservice.common.exception.ResourceNotFoundException;
import com.rideloop.userservice.verification.service.VerificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import com.rideloop.userservice.user.entity.User;
import com.rideloop.userservice.user.repository.UserRepository;
import com.rideloop.userservice.verification.service.VerificationService;
@Service
@RequiredArgsConstructor
public class CollegeServiceImpl
        implements CollegeService {

    private final CollegeRepository collegeRepository;
    private final CollegeMapper collegeMapper;
    private final VerificationService verificationService;
    private final UserRepository userRepository;
    @Override
    public boolean isSupportedCollegeEmail(
            String email) {

        String domain =
                extractDomain(email);

        return collegeRepository
                .findByEmailDomainAndActiveTrue(domain)
                .isPresent();
    }

    private String extractDomain(
            String email) {

        int index = email.indexOf("@");

        if (index == -1) {
            return "";
        }

        return email.substring(index + 1)
                .toLowerCase()
                .trim();
    }
    @Override
    public List<CollegeResponse> getAllActiveColleges() {

        return collegeRepository
                .findAll()
                .stream()
                .map(collegeMapper::toResponse)
                .toList();
    }
    @Override
    public boolean isCollegeEmailValid(
            UUID collegeId,
            String collegeEmail) {

        College college = collegeRepository.findById(collegeId)
                .orElseThrow(() ->
                        new CollegeNotSupportedException(
                                "College not found."
                        )
                );

        String domain = extractDomain(collegeEmail);

        return college.getEmailDomain()
                .equalsIgnoreCase(domain);
    }
    @Override
    public void sendCollegeVerificationOtp(
            UUID collegeId,
            String collegeEmail) {

        if (!isCollegeEmailValid(
                collegeId,
                collegeEmail)) {

            throw new CollegeNotSupportedException(
                    "College email does not match the selected college."
            );
        }

        verificationService.sendOtp(collegeEmail);
    }
    @Override
    public void verifyCollegeOtp(
            String userEmail,
            String collegeEmail,
            String otp) {

        verificationService.verifyOtp(
                collegeEmail,
                otp
        );

        User user;
        try {
            UUID id = UUID.fromString(userEmail.trim());
            user = userRepository.findById(id)
                    .or(() -> userRepository.findByEmail(userEmail.trim()))
                    .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userEmail));
        } catch (IllegalArgumentException e) {
            user = userRepository.findByEmail(userEmail.trim())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userEmail));
        }

        user.setCollegeEmail(collegeEmail.trim());
        user.setCollegeVerified(true);

        userRepository.save(user);
    }

}