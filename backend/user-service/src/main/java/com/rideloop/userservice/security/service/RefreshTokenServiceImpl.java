package com.rideloop.userservice.security.service;

import com.rideloop.userservice.common.exception.ResourceNotFoundException;
import com.rideloop.userservice.security.entity.RefreshToken;
import com.rideloop.userservice.security.repository.RefreshTokenRepository;
import com.rideloop.userservice.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RefreshTokenServiceImpl
        implements RefreshTokenService {

    private static final long REFRESH_TOKEN_VALIDITY_DAYS = 30;

    private final RefreshTokenRepository refreshTokenRepository;

    @Override
    public RefreshToken createRefreshToken(User user) {

        refreshTokenRepository.findByUser(user)
                .ifPresent(refreshTokenRepository::delete);

        RefreshToken refreshToken =
                RefreshToken.builder()
                        .token(UUID.randomUUID().toString())
                        .user(user)
                        .expiryDate(
                                LocalDateTime.now()
                                        .plusDays(REFRESH_TOKEN_VALIDITY_DAYS)
                        )
                        .revoked(false)
                        .build();

        return refreshTokenRepository.save(refreshToken);
    }

    @Override
    @Transactional(readOnly = true)
    public RefreshToken verifyRefreshToken(String token) {

        RefreshToken refreshToken =
                refreshTokenRepository.findByToken(token)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Refresh token not found."
                                ));

        if (refreshToken.isRevoked()) {
            throw new IllegalArgumentException(
                    "Refresh token has been revoked."
            );
        }

        if (refreshToken.getExpiryDate().isBefore(LocalDateTime.now())) {

            refreshTokenRepository.delete(refreshToken);

            throw new IllegalArgumentException(
                    "Refresh token has expired."
            );
        }

        // Force initialization while the transaction is active


        return refreshToken;
    }

    @Override
    public void revokeRefreshToken(User user) {

        refreshTokenRepository.findByUser(user)
                .ifPresent(token -> {
                    token.setRevoked(true);
                    refreshTokenRepository.save(token);
                });
    }
}