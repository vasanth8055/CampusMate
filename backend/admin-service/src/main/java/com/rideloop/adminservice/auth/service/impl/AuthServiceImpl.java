package com.rideloop.adminservice.auth.service.impl;

import com.rideloop.adminservice.admin.entity.Admin;
import com.rideloop.adminservice.admin.repository.AdminRepository;
import com.rideloop.adminservice.auth.dto.request.ChangePasswordRequest;
import com.rideloop.adminservice.auth.dto.request.LoginRequest;
import com.rideloop.adminservice.auth.dto.response.AuthResponse;
import com.rideloop.adminservice.auth.jwt.JwtService;
import com.rideloop.adminservice.auth.service.interfaces.AuthService;
import com.rideloop.adminservice.exception.AdminNotFoundException;
import com.rideloop.adminservice.exception.InvalidPasswordException;
import com.rideloop.adminservice.logging.AuditLogger;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final AdminRepository adminRepository;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final PasswordEncoder passwordEncoder;
    private final AuditLogger auditLogger;
    @Override
    public AuthResponse login(LoginRequest request) {

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        Admin admin = adminRepository.findByEmail(request.getEmail())
                .orElseThrow(() ->
                        new AdminNotFoundException("Admin not found."));
        auditLogger.log("Admin logged in: " + admin.getEmail());
        return AuthResponse.builder()
                .accessToken(jwtService.generateToken(admin))
                .email(admin.getEmail())
                .firstName(admin.getFirstName())
                .lastName(admin.getLastName())
                .role(admin.getRole().name())
                .build();
    }


    @Override
    public void changePassword(
            String email,
            ChangePasswordRequest request) {

        Admin admin = adminRepository.findByEmail(email)
                .orElseThrow();
        auditLogger.log("Password changed: " + admin.getEmail());
        if (!passwordEncoder.matches(
                request.getCurrentPassword(),
                admin.getPassword())) {

            throw new InvalidPasswordException(
                    "Current password is incorrect."
            );
        }

        if (!request.getNewPassword()
                .equals(request.getConfirmPassword())) {

            throw new InvalidPasswordException(
                    "Passwords do not match."
            );
        }

        admin.setPassword(
                passwordEncoder.encode(
                        request.getNewPassword()
                )
        );

        adminRepository.save(admin);
    }

    @Override
    public AuthResponse getProfile(String email) {

        Admin admin = adminRepository.findByEmail(email)
                .orElseThrow();

        return AuthResponse.builder()
                .email(admin.getEmail())
                .firstName(admin.getFirstName())
                .lastName(admin.getLastName())
                .role(admin.getRole().name())
                .build();
    }
}