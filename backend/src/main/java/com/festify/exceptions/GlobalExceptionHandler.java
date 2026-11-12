package com.festify.exceptions;

import java.util.HashMap;
import java.util.Map;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {
    private static final String ERROR_KEY = "error";
    private static final String MESSAGE_KEY = "message";

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, String>> handleDuplicateKeyException(DataIntegrityViolationException exception) {
        Map<String, String> response = new HashMap<>();
        response.put(ERROR_KEY, "Data conflict");

        String errorMessage = exception.getMostSpecificCause().getMessage().toLowerCase();

        if (errorMessage.contains("email")) {
            response.put(MESSAGE_KEY, "This email is already in use.");
        }
        else if (errorMessage.contains("participations")) {
            response.put(MESSAGE_KEY, "You are already registered to this event.");
        }
        else if (errorMessage.contains("favorites")) {
            response.put(MESSAGE_KEY, "This event is already in your favorites.");
        }
        else {
            response.put(MESSAGE_KEY, "A duplicate has been detected.");
        }

        return new ResponseEntity<>(response, HttpStatus.CONFLICT);
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<Map<String, String>> handleNotFound(ResourceNotFoundException exception) {
        Map<String, String> response = new HashMap<>();
        response.put(ERROR_KEY, "Not Found");
        response.put(MESSAGE_KEY, exception.getMessage());

        return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
    }

    // Sign-up with an email that is already taken
    @ExceptionHandler(UserAlreadyExistsException.class)
    public ResponseEntity<Map<String, String>> handleUserExists(UserAlreadyExistsException exception) {
        Map<String, String> response = new HashMap<>();
        response.put(ERROR_KEY, "Conflict");
        response.put(MESSAGE_KEY, exception.getMessage());
        return new ResponseEntity<>(response, HttpStatus.CONFLICT);
    }

    // Wrong email or password
    @ExceptionHandler(InvalidCredentialsException.class)
    public ResponseEntity<Map<String, String>> handleInvalidCredentials(InvalidCredentialsException exception) {
        Map<String, String> response = new HashMap<>();
        response.put(ERROR_KEY, "Unauthorized");
        response.put(MESSAGE_KEY, exception.getMessage());
        return new ResponseEntity<>(response, HttpStatus.UNAUTHORIZED);
    }

    // Fallback for any other runtime error
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, String>> handleRuntimeException(RuntimeException exception) {
        Map<String, String> response = new HashMap<>();
        response.put(ERROR_KEY, "Bad Request");
        response.put(MESSAGE_KEY, exception.getMessage());
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }
}