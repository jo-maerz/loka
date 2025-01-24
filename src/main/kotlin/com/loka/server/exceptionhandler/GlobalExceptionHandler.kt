package com.loka.server.exceptionhandler

import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.RestControllerAdvice
import com.fasterxml.jackson.core.JsonProcessingException
import org.springframework.http.ResponseEntity

@RestControllerAdvice
class GlobalExceptionHandler {

    @ExceptionHandler(JsonProcessingException::class)
    fun handleJsonException(ex: JsonProcessingException): ResponseEntity<String> {
        return ResponseEntity.badRequest().body("Invalid JSON: ${ex.message}")
    }
}