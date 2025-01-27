package com.loka.server.exceptionhandler

import com.fasterxml.jackson.core.JsonProcessingException
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.ControllerAdvice
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.dao.DataIntegrityViolationException
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException

@ControllerAdvice
class GlobalExceptionHandler {

    @ExceptionHandler(JsonProcessingException::class)
    fun handleJsonException(ex: JsonProcessingException): ResponseEntity<String> {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid JSON: ${ex.message}")
    }

    @ExceptionHandler(IllegalArgumentException::class)
    fun handleIllegalArgumentException(ex: IllegalArgumentException): ResponseEntity<String> {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.message)
    }

    @ExceptionHandler(DataIntegrityViolationException::class)
    fun handleDataIntegrityViolationException(ex: DataIntegrityViolationException): ResponseEntity<String> {
        return ResponseEntity.status(HttpStatus.CONFLICT).body("Data integrity violation: ${ex.message}")
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException::class)
    fun handleMethodArgumentTypeMismatchException(ex: MethodArgumentTypeMismatchException): ResponseEntity<String> {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid parameter: ${ex.message}")
    }

    @ExceptionHandler(Exception::class)
    fun handleGeneralException(ex: Exception): ResponseEntity<String> {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An unexpected error occurred.")
    }
}
