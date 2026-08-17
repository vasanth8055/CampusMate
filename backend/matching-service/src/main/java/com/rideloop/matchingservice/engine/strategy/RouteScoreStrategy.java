package com.rideloop.matchingservice.engine.strategy;

import com.rideloop.matchingservice.dto.client.TripResponse;
import com.rideloop.matchingservice.dto.request.MatchRequest;
import com.rideloop.matchingservice.engine.MatchWeight;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.Set;
import java.util.stream.Collectors;

@Component
@Slf4j
public class RouteScoreStrategy implements MatchScoreStrategy {

    private static final Set<String> STOP_WORDS = Set.of(
            "india", "andhra", "pradesh", "telangana", "district", "urban", "rural", "ntr", "near", "road", "street", "520010", "521108"
    );

    @Value("${matching.pickup-radius-km:5.0}")
    private double pickupRadiusKm = 5.0;

    @Override
    public double calculate(
            TripResponse trip,
            MatchRequest request) {

        if (hasCoordinates(trip, request)) {
            double distanceKm = calculateHaversineDistanceKm(
                    request.sourceLatitude(),
                    request.sourceLongitude(),
                    trip.sourceLatitude(),
                    trip.sourceLongitude()
            );

            log.debug("Distance between rider ({}, {}) and trip ({}, {}): {} km (max radius: {} km)",
                    request.sourceLatitude(), request.sourceLongitude(),
                    trip.sourceLatitude(), trip.sourceLongitude(),
                    distanceKm, pickupRadiusKm);

            if (distanceKm > pickupRadiusKm) {
                return 0.0;
            }

            double normalized = Math.max(0.0, 1.0 - (distanceKm / pickupRadiusKm));
            return normalized * MatchWeight.ROUTE * 100;
        }

        // Fallback for legacy trips without coordinates
        if (isAddressCompatible(trip.source(), request.source())) {
            return 0.85 * MatchWeight.ROUTE * 100;
        }

        return 0.0;
    }

    public boolean isGeographicallyCompatible(
            TripResponse trip,
            MatchRequest request) {

        if (hasCoordinates(trip, request)) {
            double distanceKm = calculateHaversineDistanceKm(
                    request.sourceLatitude(),
                    request.sourceLongitude(),
                    trip.sourceLatitude(),
                    trip.sourceLongitude()
            );
            return distanceKm <= pickupRadiusKm;
        }

        return isAddressCompatible(trip.source(), request.source());
    }

    public double getDistanceKm(TripResponse trip, MatchRequest request) {
        if (hasCoordinates(trip, request)) {
            return calculateHaversineDistanceKm(
                    request.sourceLatitude(),
                    request.sourceLongitude(),
                    trip.sourceLatitude(),
                    trip.sourceLongitude()
            );
        }
        return -1.0;
    }

    private boolean hasCoordinates(TripResponse trip, MatchRequest request) {
        return request.sourceLatitude() != null
                && request.sourceLongitude() != null
                && trip.sourceLatitude() != null
                && trip.sourceLongitude() != null;
    }

    public static double calculateHaversineDistanceKm(
            double lat1, double lon1,
            double lat2, double lon2) {

        final int EARTH_RADIUS_KM = 6371;

        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);

        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLon / 2) * Math.sin(dLon / 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return Math.round(EARTH_RADIUS_KM * c * 100.0) / 100.0;
    }

    private boolean isAddressCompatible(String source1, String source2) {
        if (source1 == null || source2 == null) {
            return false;
        }

        String s1 = source1.trim().toLowerCase();
        String s2 = source2.trim().toLowerCase();

        if (s1.equals(s2) || s1.contains(s2) || s2.contains(s1)) {
            return true;
        }

        Set<String> tokens1 = extractLocalityTokens(s1);
        Set<String> tokens2 = extractLocalityTokens(s2);

        for (String token : tokens1) {
            if (tokens2.contains(token)) {
                return true;
            }
        }

        return false;
    }

    private Set<String> extractLocalityTokens(String address) {
        return Arrays.stream(address.toLowerCase().split("[,\\s/]+"))
                .map(String::trim)
                .filter(token -> token.length() >= 4 && !STOP_WORDS.contains(token))
                .collect(Collectors.toSet());
    }
}