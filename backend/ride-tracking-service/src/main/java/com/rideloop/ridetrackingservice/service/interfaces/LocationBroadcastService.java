package com.rideloop.ridetrackingservice.service.interfaces;

import com.rideloop.ridetrackingservice.dto.response.RideLocationResponse;

public interface LocationBroadcastService {

    void broadcastLocation(
            RideLocationResponse location
    );
}