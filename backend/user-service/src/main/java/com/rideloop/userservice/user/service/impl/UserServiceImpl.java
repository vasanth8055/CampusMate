package com.rideloop.userservice.user.service.impl;

import com.rideloop.sharedkernel.dto.ApiResponse;
import com.rideloop.userservice.security.entity.RefreshToken;
import com.rideloop.userservice.security.service.RefreshTokenService;
import com.rideloop.userservice.user.dto.UserResponse;
import com.rideloop.userservice.user.dto.ChangePasswordRequest;
import com.rideloop.userservice.auth.dto.request.LoginRequest;
import com.rideloop.userservice.auth.dto.request.RegisterRequest;
import com.rideloop.userservice.user.dto.UpdateUserRequest;
import com.rideloop.userservice.auth.dto.response.AuthResponse;
import com.rideloop.userservice.user.entity.User;
import com.rideloop.userservice.common.exception.DuplicateResourceException;
import com.rideloop.userservice.common.exception.ResourceNotFoundException;
import com.rideloop.userservice.user.mapper.UserMapper;
import com.rideloop.userservice.user.repository.UserRepository;
import com.rideloop.userservice.security.JwtService;
import com.rideloop.userservice.user.service.interfaces.UserService;
import com.rideloop.userservice.verification.service.VerificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

import com.rideloop.userservice.user.entity.enums.UserStatus;
import com.rideloop.userservice.verification.dto.PendingRegistration;
import com.rideloop.userservice.verification.exception.InvalidOtpException;
@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserMapper userMapper;
    private final VerificationService verificationService;
    private final RefreshTokenService refreshTokenService;

    @Override
    public AuthResponse register(RegisterRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Email already exists");
        }

        if (userRepository.existsByPhoneNumber(request.getPhoneNumber())) {
            throw new DuplicateResourceException("Phone number already exists");
        }

        request.setPassword(
                passwordEncoder.encode(request.getPassword())
        );

        verificationService.saveRegistration(request);

        verificationService.sendOtp(request.getEmail());

        return AuthResponse.builder()
                .email(request.getEmail())
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .build();
    }

    @Override
    public AuthResponse login(LoginRequest request) {

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User not found."
                        )
                );

        String accessToken =
                jwtService.generateToken(user);

        RefreshToken refreshToken =
                refreshTokenService.createRefreshToken(user);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken.getToken())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .build();
    }
    @Override
    public void forgotPassword(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User not found."
                        )
                );

        verificationService.sendPasswordResetOtp(
                user.getEmail()
        );
    }
    @Override
    public UserResponse getUserById(UUID id) {

        User user = userRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found"));

        return userMapper.toResponse(user);
    }
    @Override
    public List<UserResponse> getAllUsers() {

        return userRepository.findAll()
                .stream()
                .map(userMapper::toResponse)
                .toList();
    }
    @Override
    public UserResponse getCurrentUser(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found"));

        return userMapper.toResponse(user);
    }

    @Override
    public void deleteUser(UUID id) {

        User user = userRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found"));

        userRepository.delete(user);
    }
    @Override
    public ApiResponse<Void> logout() {

        String email =
                SecurityContextHolder.getContext()
                        .getAuthentication()
                        .getName();

        User user =
                userRepository.findByEmail(email)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "User not found."
                                ));

        refreshTokenService.revokeRefreshToken(user);

        SecurityContextHolder.clearContext();

        return ApiResponse.<Void>builder()
                .success(true)
                .message("Logout successful.")
                .build();
    }
    @Override
    public UserResponse updateCurrentUser(String email,
                                          UpdateUserRequest request) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found"));

        if (!user.getPhoneNumber().equals(request.getPhoneNumber())
                && userRepository.existsByPhoneNumber(request.getPhoneNumber())) {
            throw new DuplicateResourceException("Phone number already exists");
        }

        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setPhoneNumber(request.getPhoneNumber());

        user = userRepository.save(user);

        return userMapper.toResponse(user);
    }
    @Override
    public void deleteCurrentUser(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        userRepository.delete(user);
    }
    @Override
    public void changePassword(String email, ChangePasswordRequest request) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found"));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Current password is incorrect");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));

        userRepository.save(user);
    }
    @Override
    public void verifyEmail(
            String email,
            String otp) {

        verificationService.verifyOtp(email, otp);

        PendingRegistration registration =
                verificationService.getRegistration(email);

        if (registration == null) {
            throw new ResourceNotFoundException(
                    "Registration expired. Please register again."
            );
        }

        User user =
                userMapper.toEntity(registration);

        user.setEmailVerified(true);
        user.setStatus(UserStatus.ACTIVE);

        userRepository.save(user);

        verificationService.deleteRegistration(email);
    }
    @Override
    public void blockUser(UUID userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found."));

        user.setStatus(UserStatus.BLOCKED);

        userRepository.save(user);
    }

    @Override
    public void unblockUser(UUID userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found."));

        user.setStatus(UserStatus.ACTIVE);

        userRepository.save(user);
    }
    @Override
    public void resetPassword(
            String email,
            String otp,
            String newPassword) {

        verificationService.verifyPasswordResetOtp(
                email,
                otp
        );

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User not found."
                        )
                );

        user.setPassword(
                passwordEncoder.encode(newPassword)
        );

        userRepository.save(user);
    }
    @Override
    public AuthResponse refreshToken(String refreshToken) {

        RefreshToken token =
                refreshTokenService.verifyRefreshToken(
                        refreshToken
                );

        User user = token.getUser();

        String accessToken =
                jwtService.generateToken(user);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(token.getToken())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .build();
    }
}