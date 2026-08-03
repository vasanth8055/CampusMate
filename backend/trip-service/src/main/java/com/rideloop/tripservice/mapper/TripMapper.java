package com.rideloop.tripservice.mapper;

import com.rideloop.tripservice.dto.request.CreateTripRequest;
import com.rideloop.tripservice.dto.request.UpdateTripRequest;
import com.rideloop.tripservice.dto.response.TripResponse;
import com.rideloop.tripservice.entity.Trip;
import org.mapstruct.*;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface TripMapper {

    TripResponse toResponse(Trip trip);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "driverId", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Trip toEntity(CreateTripRequest request);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "driverId", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateTrip(UpdateTripRequest request,
                    @MappingTarget Trip trip);

}