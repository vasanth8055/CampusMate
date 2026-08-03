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

        private String role;

        private String status;
    }

