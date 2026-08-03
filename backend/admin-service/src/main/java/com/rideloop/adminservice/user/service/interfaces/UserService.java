package com.rideloop.adminservice.user.service.interfaces;

import com.rideloop.adminservice.user.dto.response.UserResponse;

import java.util.List;
import java.util.UUID;

public interface UserService {

    List<UserResponse> getUsers();

    UserResponse getUser(UUID userId);

    void blockUser(UUID userId);

    void unblockUser(UUID userId);
}