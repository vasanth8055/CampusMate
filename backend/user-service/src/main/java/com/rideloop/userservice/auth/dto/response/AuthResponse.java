package com.rideloop.userservice.auth.dto.response;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponse {

    private String accessToken;

    private String refreshToken;

    private String email;

    private String firstName;

    private String lastName;
}