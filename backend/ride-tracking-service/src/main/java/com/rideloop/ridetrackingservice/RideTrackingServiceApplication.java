package com.rideloop.ridetrackingservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableFeignClients
public class RideTrackingServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(RideTrackingServiceApplication.class, args);
    }

}
