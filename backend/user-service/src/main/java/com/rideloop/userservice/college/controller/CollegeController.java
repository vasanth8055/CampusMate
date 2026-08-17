package com.rideloop.userservice.college.controller;

import com.rideloop.sharedkernel.dto.ApiResponse;
import com.rideloop.userservice.college.dto.request.CollegeVerificationRequest;
import com.rideloop.userservice.college.dto.request.VerifyCollegeOtpRequest;
import com.rideloop.userservice.college.dto.response.CollegeResponse;
import com.rideloop.userservice.college.service.interfaces.CollegeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import org.springframework.security.core.Authentication;
@RestController
@RequestMapping("/api/v1/colleges")
@RequiredArgsConstructor
public class CollegeController {

    private final CollegeService collegeService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<CollegeResponse>>> getColleges() {

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Colleges fetched successfully",
                        collegeService.getAllActiveColleges()
                )
        );
    }
    @PostMapping("/send-verification-otp")
    public ResponseEntity<ApiResponse<Void>> sendCollegeOtp(
            @Valid
            @RequestBody CollegeVerificationRequest request) {

        collegeService.sendCollegeVerificationOtp(
                request.getCollegeId(),
                request.getCollegeEmail()
        );

        return ResponseEntity.ok(
                ApiResponse.success(
                        "College verification OTP sent successfully.",
                        null
                )
        );
    }
    @PostMapping("/verify-otp")
    public ResponseEntity<ApiResponse<Void>> verifyCollegeOtp(
            @org.springframework.security.core.annotation.AuthenticationPrincipal
            com.rideloop.sharedkernel.security.AuthenticatedUser user,
            Authentication authentication,
            @Valid @RequestBody VerifyCollegeOtpRequest request) {

        String identifier = (user != null && user.getEmail() != null && !user.getEmail().isBlank()) ? user.getEmail()
                : (user != null && user.getUserId() != null) ? user.getUserId().toString()
                : (authentication != null ? authentication.getName() : null);

        if (identifier == null || identifier.isBlank()) {
            throw new IllegalStateException("Unauthenticated user");
        }

        collegeService.verifyCollegeOtp(
                identifier,
                request.getCollegeEmail(),
                request.getOtp()
        );

        return ResponseEntity.ok(
                ApiResponse.success(
                        "College email verified successfully.",
                        null
                )
        );
    }
}