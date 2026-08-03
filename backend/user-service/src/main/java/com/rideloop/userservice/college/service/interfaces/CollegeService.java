package com.rideloop.userservice.college.service.interfaces;

import com.rideloop.userservice.college.dto.response.CollegeResponse;

import java.util.List;
import java.util.UUID;
public interface CollegeService {

    boolean isSupportedCollegeEmail(String email);

    boolean isCollegeEmailValid(
            UUID collegeId,
            String collegeEmail
    );

    void sendCollegeVerificationOtp(
            UUID collegeId,
            String collegeEmail
    );
    void verifyCollegeOtp(
            String userEmail,
            String collegeEmail,
            String otp
    );

    List<CollegeResponse> getAllActiveColleges();
}