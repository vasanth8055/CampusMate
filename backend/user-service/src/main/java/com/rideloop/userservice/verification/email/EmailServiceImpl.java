package com.rideloop.userservice.verification.email;

import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailServiceImpl
        implements EmailService {

    private final JavaMailSender mailSender;

    @Override
    public void sendOtp(
            String email,
            String otp) {

        SimpleMailMessage message =
                new SimpleMailMessage();

        message.setTo(email);

        message.setSubject(
                "RideLoop Email Verification"
        );

        message.setText(
                """
                Hello,

                Your RideLoop verification code is:

                %s

                This OTP expires in 5 minutes.

                If you didn't request this, please ignore this email.

                RideLoop Team
                """.formatted(otp)
        );

        mailSender.send(message);
    }
}