package com.rideloop.userservice.security.service;

import com.rideloop.userservice.security.entity.RefreshToken;
import com.rideloop.userservice.user.entity.User;

public interface RefreshTokenService {

    RefreshToken createRefreshToken(User user);

    RefreshToken verifyRefreshToken(String token);

    void revokeRefreshToken(User user);
}