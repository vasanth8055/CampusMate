package com.rideloop.userservice.college.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class CollegeVerificationRequest {

    @NotNull
    private UUID collegeId;

    @Email
    private String collegeEmail;
}