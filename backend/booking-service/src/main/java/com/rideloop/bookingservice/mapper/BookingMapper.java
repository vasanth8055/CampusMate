package com.rideloop.bookingservice.mapper;

import com.rideloop.bookingservice.dto.response.BookingResponse;
import com.rideloop.bookingservice.entity.Booking;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;

@Mapper(
        componentModel = MappingConstants.ComponentModel.SPRING
)
public interface BookingMapper {

    BookingResponse toResponse(Booking booking);
}