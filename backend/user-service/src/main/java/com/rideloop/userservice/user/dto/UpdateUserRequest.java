package com.rideloop.userservice.user.dto;

import jakarta.validation.constraints.Pattern;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateUserRequest {

    private String firstName;

    private String lastName;

    @Pattern(
            regexp = "^([6-9]\\d{9})?$",
            message = "Invalid phone number"
    )
    private String phoneNumber;

    private String homeAddress;

    private Double homeLatitude;

    private Double homeLongitude;

    private String collegeEmail;
}