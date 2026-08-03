package com.rideloop.bookingservice.exception;

import com.rideloop.sharedkernel.dto.ApiResponse;
import feign.FeignException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(BookingNotFoundException.class)
    public ResponseEntity<ApiResponse<Void>>
    handleNotFound(
            BookingNotFoundException exception) {

        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(
                        ApiResponse.failure(
                                exception.getMessage()
                        )
                );
    }

    @ExceptionHandler(BookingConflictException.class)
    public ResponseEntity<ApiResponse<Void>>
    handleConflict(
            BookingConflictException exception) {

        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(
                        ApiResponse.failure(
                                exception.getMessage()
                        )
                );
    }

    @ExceptionHandler(
            ForbiddenBookingOperationException.class
    )
    public ResponseEntity<ApiResponse<Void>>
    handleForbidden(
            ForbiddenBookingOperationException exception) {

        return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body(
                        ApiResponse.failure(
                                exception.getMessage()
                        )
                );
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Void>>
    handleValidation(
            MethodArgumentNotValidException exception) {

        String message =
                exception.getBindingResult()
                        .getFieldErrors()
                        .stream()
                        .map(error ->
                                error.getField()
                                        + ": "
                                        + error.getDefaultMessage()
                        )
                        .collect(
                                Collectors.joining(", ")
                        );

        return ResponseEntity
                .badRequest()
                .body(
                        ApiResponse.failure(message)
                );
    }

    @ExceptionHandler(FeignException.NotFound.class)
    public ResponseEntity<ApiResponse<Void>>
    handleFeignNotFound(
            FeignException.NotFound exception) {

        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(
                        ApiResponse.failure(
                                "Trip not found"
                        )
                );
    }

    @ExceptionHandler(FeignException.BadRequest.class)
    public ResponseEntity<ApiResponse<Void>>
    handleFeignBadRequest(
            FeignException.BadRequest exception) {

        return ResponseEntity
                .badRequest()
                .body(
                        ApiResponse.failure(
                                "Trip request could not be processed"
                        )
                );
    }

    @ExceptionHandler(FeignException.class)
    public ResponseEntity<ApiResponse<Void>>
    handleFeignException(
            FeignException exception) {

        return ResponseEntity
                .status(HttpStatus.BAD_GATEWAY)
                .body(
                        ApiResponse.failure(
                                "Trip Service is currently unavailable or rejected the request"
                        )
                );
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>>
    handleUnexpected(Exception exception) {

        return ResponseEntity
                .status(
                        HttpStatus.INTERNAL_SERVER_ERROR
                )
                .body(
                        ApiResponse.failure(
                                "An unexpected error occurred"
                        )
                );
    }
}