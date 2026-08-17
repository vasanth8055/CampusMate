package com.rideloop.adminservice.user.dto.response;

import lombok.*;

import java.util.UUID;


@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor @Builder
public  class UserResponse {

        private UUID id;

        private String firstName;

        private String lastName;

        private String email;

        private String phoneNumber;

        private boolean emailVerified;

        private boolean collegeVerified;

        private String collegeName;

        private String collegeEmail;

        private String role;

        private String status;

        private java.time.LocalDateTime createdAt;

        private java.time.LocalDateTime updatedAt;
    }

