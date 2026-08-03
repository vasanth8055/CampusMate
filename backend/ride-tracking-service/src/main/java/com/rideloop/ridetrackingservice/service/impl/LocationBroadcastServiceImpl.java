package com.rideloop.ridetrackingservice.service.impl;

import com.rideloop.ridetrackingservice.dto.response.RideLocationResponse;
import com.rideloop.ridetrackingservice.service.interfaces.LocationBroadcastService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class LocationBroadcastServiceImpl
        implements LocationBroadcastService {

    private final SimpMessagingTemplate messagingTemplate;

    @Override
    public void broadcastLocation(
            RideLocationResponse location) {

        messagingTemplate.convertAndSend(
                "/topic/trips/" + location.tripId(),
                location
        );
    }
}