package com.rideloop.userservice.user.dto;

import com.rideloop.userservice.user.entity.enums.UserRole;
import com.rideloop.userservice.user.entity.enums.UserStatus;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResponse {

    private UUID id;

    private String firstName;

    private String lastName;

    private String email;

    private String phoneNumber;

    private UserRole role;

    private UserStatus status;

    private String homeAddress;

    private Double homeLatitude;

    private Double homeLongitude;

    private boolean emailVerified;

    private String collegeEmail;

    private boolean collegeVerified;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}