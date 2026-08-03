package com.rideloop.userservice.verification.dto;

import lombok.*;

import java.io.Serializable;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PendingRegistration implements Serializable {

    private String firstName;

    private String lastName;

    private String email;

    private String password;

    private String phoneNumber;

    private String collegeEmail;
}