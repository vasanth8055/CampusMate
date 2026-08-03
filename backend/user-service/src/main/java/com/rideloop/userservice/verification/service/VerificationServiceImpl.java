package com.rideloop.userservice.verification.service;

import com.rideloop.userservice.auth.dto.request.RegisterRequest;
import com.rideloop.userservice.common.constants.RedisKeys;
import com.rideloop.userservice.verification.dto.PendingRegistration;
import com.rideloop.userservice.verification.email.EmailService;
import com.rideloop.userservice.verification.exception.InvalidOtpException;
import com.rideloop.userservice.verification.redis.RedisOtpRepository;
import com.rideloop.userservice.verification.redis.RedisRegistrationRepository;
import com.rideloop.userservice.verification.util.OtpGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class VerificationServiceImpl implements VerificationService {

    private final RedisOtpRepository redisOtpRepository;
    private final RedisRegistrationRepository redisRegistrationRepository;
    private final EmailService emailService;
    private final OtpGenerator otpGenerator;

    @Override
    public void sendOtp(String email) {

        String otp = otpGenerator.generateOtp();

        redisOtpRepository.saveOtp(
                RedisKeys.REGISTER_OTP + email,
                otp
        );

        emailService.sendOtp(email, otp);
    }

    @Override
    public boolean verifyOtp(String email, String otp) {

        String storedOtp = redisOtpRepository.getOtp(
                RedisKeys.REGISTER_OTP + email
        );

        if (storedOtp == null) {
            throw new InvalidOtpException(
                    "OTP expired or not found."
            );
        }

        if (!storedOtp.equals(otp)) {
            throw new InvalidOtpException(
                    "Invalid OTP."
            );
        }

        redisOtpRepository.deleteOtp(
                RedisKeys.REGISTER_OTP + email
        );

        return true;
    }

    @Override
    public void resendOtp(String email) {

        sendOtp(email);
    }

    @Override
    public void saveRegistration(RegisterRequest request) {

        PendingRegistration registration =
                PendingRegistration.builder()
                        .firstName(request.getFirstName())
                        .lastName(request.getLastName())
                        .email(request.getEmail())
                        .password(request.getPassword())
                        .phoneNumber(request.getPhoneNumber())
                        .collegeEmail(request.getCollegeEmail())
                        .build();

        redisRegistrationRepository.saveRegistration(
                RedisKeys.REGISTER_DATA + request.getEmail(),
                registration
        );
    }

    @Override
    public PendingRegistration getRegistration(String email) {

        return redisRegistrationRepository.getRegistration(
                RedisKeys.REGISTER_DATA + email
        );
    }

    @Override
    public void deleteRegistration(String email) {

        redisRegistrationRepository.deleteRegistration(
                RedisKeys.REGISTER_DATA + email
        );
    }
    @Override
    public void sendPasswordResetOtp(String email) {

        String otp = otpGenerator.generateOtp();

        redisOtpRepository.saveOtp(
                RedisKeys.RESET_PASSWORD_OTP + email,
                otp
        );

        emailService.sendOtp(email, otp);
    }

    @Override
    public boolean verifyPasswordResetOtp(
            String email,
            String otp) {

        String storedOtp = redisOtpRepository.getOtp(
                RedisKeys.RESET_PASSWORD_OTP + email
        );

        if (storedOtp == null) {
            throw new InvalidOtpException(
                    "OTP expired or not found."
            );
        }

        if (!storedOtp.equals(otp)) {
            throw new InvalidOtpException(
                    "Invalid OTP."
            );
        }

        redisOtpRepository.deleteOtp(
                RedisKeys.RESET_PASSWORD_OTP + email
        );

        return true;
    }
}