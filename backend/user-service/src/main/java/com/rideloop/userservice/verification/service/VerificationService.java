package com.rideloop.userservice.verification.service;

import com.rideloop.userservice.auth.dto.request.RegisterRequest;
import com.rideloop.userservice.verification.dto.PendingRegistration;

public interface VerificationService {

    void sendOtp(String email);

    boolean verifyOtp(String email,
                      String otp);

    void resendOtp(String email);

    void saveRegistration(RegisterRequest request);

    PendingRegistration getRegistration(String email);

    void deleteRegistration(String email);
    void sendPasswordResetOtp(String email);

    boolean verifyPasswordResetOtp(
            String email,
            String otp
    );
}