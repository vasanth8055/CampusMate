package com.rideloop.sharedkernel.security;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class AuthenticatedUser {

    private UUID userId;
    private String email;
    private String role;
}