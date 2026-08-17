package com.rideloop.userservice.auth.dto.response;

import com.rideloop.userservice.user.entity.enums.UserRole;
import lombok.*;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponse {

    private String accessToken;

    private String refreshToken;

    private UUID userId;

    private String email;

    private String firstName;

    private String lastName;

    private UserRole role;
}