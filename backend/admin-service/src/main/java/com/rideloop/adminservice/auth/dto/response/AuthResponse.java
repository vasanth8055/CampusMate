package com.rideloop.adminservice.auth.dto.response;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponse {

    private String accessToken;

    private String email;

    private String firstName;

    private String lastName;

    private String role;
}