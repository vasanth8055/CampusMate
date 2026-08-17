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

    @ExceptionHandler(FeignException.Conflict.class)
    public ResponseEntity<ApiResponse<Void>>
    handleFeignConflict(
            FeignException.Conflict exception) {

        String message = extractErrorMessage(
                exception,
                "Not enough seats available"
        );

        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(
                        ApiResponse.failure(message)
                );
    }

    @ExceptionHandler(FeignException.NotFound.class)
    public ResponseEntity<ApiResponse<Void>>
    handleFeignNotFound(
            FeignException.NotFound exception) {

        String message = extractErrorMessage(
                exception,
                "Trip not found"
        );

        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(
                        ApiResponse.failure(message)
                );
    }

    @ExceptionHandler(FeignException.BadRequest.class)
    public ResponseEntity<ApiResponse<Void>>
    handleFeignBadRequest(
            FeignException.BadRequest exception) {

        String message = extractErrorMessage(
                exception,
                "Trip request could not be processed"
        );

        return ResponseEntity
                .badRequest()
                .body(
                        ApiResponse.failure(message)
                );
    }

    @ExceptionHandler(FeignException.class)
    public ResponseEntity<ApiResponse<Void>>
    handleFeignException(
            FeignException exception) {

        if (exception.status() == 409) {
            String message = extractErrorMessage(
                    exception,
                    "Not enough seats available"
            );
            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body(ApiResponse.failure(message));
        }

        String message = extractErrorMessage(
                exception,
                "Trip Service is currently unavailable or rejected the request"
        );

        return ResponseEntity
                .status(HttpStatus.BAD_GATEWAY)
                .body(
                        ApiResponse.failure(message)
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
                                "An unexpected error occurred: " + exception.getMessage()
                        )
                );
    }

    private String extractErrorMessage(FeignException exception, String fallback) {
        try {
            String content = exception.contentUTF8();
            if (content != null && !content.isBlank()) {
                com.fasterxml.jackson.databind.ObjectMapper mapper =
                        new com.fasterxml.jackson.databind.ObjectMapper();
                com.fasterxml.jackson.databind.JsonNode node = mapper.readTree(content);
                if (node.has("message") && !node.get("message").isNull()) {
                    return node.get("message").asText();
                }
            }
        } catch (Exception ignored) {
        }
        return fallback;
    }
}