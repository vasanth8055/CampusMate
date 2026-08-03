package com.rideloop.matchingservice.engine;

public final class MatchWeight {

    private MatchWeight() {
    }

    public static final double ROUTE = 0.35;

    public static final double TIME = 0.25;

    public static final double SEATS = 0.15;

    public static final double RECURRING = 0.15;

    public static final double PRICE = 0.10;
}