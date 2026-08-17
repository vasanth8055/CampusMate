package com.rideloop.userservice.verification.email;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailServiceImpl
        implements EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:campusmate.teamofficial@gmail.com}")
    private String fromEmail;

    @Override
    public void sendOtp(
            String email,
            String otp) {

        SimpleMailMessage message =
                new SimpleMailMessage();

        message.setFrom(fromEmail);
        message.setTo(email);
        message.setSubject("CampusMate Email Verification");
        message.setText(
                """
                Hello,

                Your CampusMate verification code is:

                %s

                This OTP expires in 5 minutes.

                If you didn't request this, please ignore this email.

                CampusMate Team
                """.formatted(otp)
        );

        try {
            mailSender.send(message);
        } catch (MailException ex) {
            log.warn("Failed to send OTP email to {}: {}. Falling back to console output.", email, ex.getMessage());
            log.info("OTP for {} is {}", email, otp);
        }
    }
}