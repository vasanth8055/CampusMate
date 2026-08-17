package com.rideloop.userservice.driver.vehicle.mapper;

import com.rideloop.userservice.driver.entity.DriverProfile;
import com.rideloop.userservice.driver.vehicle.dto.request.CreateVehicleRequest;
import com.rideloop.userservice.driver.vehicle.dto.request.UpdateVehicleRequest;
import com.rideloop.userservice.driver.vehicle.dto.response.VehicleResponse;
import com.rideloop.userservice.driver.vehicle.entity.Vehicle;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class VehicleMapper {

    public Vehicle toEntity(
            CreateVehicleRequest request,
            DriverProfile driver) {

        return Vehicle.builder()
                .driver(driver)
                .vehicleType(request.vehicleType())
                .brand(request.brand())
                .model(request.model())
                .color(request.color())
                .registrationNumber(request.registrationNumber())
                .maxPassengerCapacity(request.maxPassengerCapacity())
                .build();
    }

    public void updateVehicle(
            UpdateVehicleRequest request,
            Vehicle vehicle) {

        vehicle.setVehicleType(request.vehicleType());
        vehicle.setBrand(request.brand());
        vehicle.setModel(request.model());
        vehicle.setColor(request.color());
        vehicle.setRegistrationNumber(request.registrationNumber());
        vehicle.setMaxPassengerCapacity(request.maxPassengerCapacity());
    }

    public VehicleResponse toResponse(Vehicle vehicle) {
        if (vehicle == null) return null;

        UUID driverId = null;
        if (vehicle.getDriver() != null) {
            driverId = vehicle.getDriver().getId();
        }

        return new VehicleResponse(
                vehicle.getId(),
                driverId,
                vehicle.getVehicleType(),
                vehicle.getBrand(),
                vehicle.getModel(),
                vehicle.getColor(),
                vehicle.getRegistrationNumber(),
                vehicle.getMaxPassengerCapacity(),
                vehicle.getRcImageUrl(),
                vehicle.getStatus()
        );
    }
}