package com.rideloop.userservice.verification.email;

public interface EmailService {

    void sendOtp(
            String email,
            String otp
    );
}