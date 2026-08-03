package com.rideloop.userservice.college.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class VerifyCollegeOtpRequest {

    @Email
    private String collegeEmail;

    @NotBlank
    private String otp;
}