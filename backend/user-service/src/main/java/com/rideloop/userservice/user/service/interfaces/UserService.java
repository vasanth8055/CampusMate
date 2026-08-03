package com.rideloop.userservice.user.service.interfaces;

import com.rideloop.sharedkernel.dto.ApiResponse;
import com.rideloop.userservice.user.dto.ChangePasswordRequest;
import com.rideloop.userservice.auth.dto.request.LoginRequest;
import com.rideloop.userservice.auth.dto.request.RegisterRequest;
import com.rideloop.userservice.user.dto.UpdateUserRequest;
import com.rideloop.userservice.auth.dto.response.AuthResponse;
import com.rideloop.userservice.user.dto.UserResponse;

import java.util.List;
import java.util.UUID;

public interface UserService {

    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);

    UserResponse getUserById(UUID id);

    List<UserResponse> getAllUsers();

    UserResponse getCurrentUser(String email);

    UserResponse updateCurrentUser(String email, UpdateUserRequest request);
    void deleteUser(UUID id);

    ApiResponse<Void> logout();

    void deleteCurrentUser(String email);
    void changePassword(String email, ChangePasswordRequest request);
    void verifyEmail(
            String email,
            String otp
    );
    void blockUser(UUID userId);

    void unblockUser(UUID userId);
    void forgotPassword(String email);

    void resetPassword(
            String email,
            String otp,
            String newPassword
    );
    AuthResponse refreshToken(String refreshToken);
}
