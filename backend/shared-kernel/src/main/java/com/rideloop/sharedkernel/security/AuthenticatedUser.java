package com.rideloop.sharedkernel.security;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.security.Principal;
import java.util.UUID;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class AuthenticatedUser implements Principal {

    private UUID userId;
    private String email;
    private String role;

    @Override
    public String getName() {
        return email != null ? email : (userId != null ? userId.toString() : "");
    }
}