package com.rideloop.adminservice.auth.service.interfaces;

import com.rideloop.adminservice.auth.dto.request.ChangePasswordRequest;
import com.rideloop.adminservice.auth.dto.request.LoginRequest;
import com.rideloop.adminservice.auth.dto.response.AuthResponse;

public interface AuthService {

    AuthResponse login(LoginRequest request);

    void changePassword(
            String email,
            ChangePasswordRequest request
    );

    AuthResponse getProfile(String email);
}