package com.rideloop.adminservice.user.service.impl;

import com.rideloop.adminservice.client.UserServiceClient;
import com.rideloop.adminservice.logging.AuditLogger;
import com.rideloop.adminservice.user.dto.response.UserResponse;
import com.rideloop.adminservice.user.service.interfaces.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserServiceClient userServiceClient;
    private final AuditLogger auditLogger;
    @Override
    public List<UserResponse> getUsers() {
        return userServiceClient.getUsers().getData();
    }

    @Override
    public UserResponse getUser(UUID userId) {
        return userServiceClient.getUser(userId).getData();
    }

    @Override
    public void blockUser(UUID userId) {
        userServiceClient.blockUser(userId);
        auditLogger.log("Blocked user: " + userId);
    }

    @Override
    public void unblockUser(UUID userId) {
        userServiceClient.unblockUser(userId);
        userServiceClient.unblockUser(userId);
    }
}