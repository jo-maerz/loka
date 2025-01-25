// UserController.kt
package com.loka.server.controller

import com.loka.server.entity.User
import com.loka.server.service.UserService
import org.slf4j.LoggerFactory
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/auth")
class UserController(
    private val userService: UserService
) {

    private val logger = LoggerFactory.getLogger(UserController::class.java)

    data class SignUpRequest(
        val email: String,
        val password: String,
        val firstName: String,
        val lastName: String
    )

    @PostMapping("/signup")
    fun signUp(@RequestBody signUpRequest: SignUpRequest): ResponseEntity<User> {
        return try {
            val user: User = userService.registerUser(
                email = signUpRequest.email,
                password = signUpRequest.password,
                firstName = signUpRequest.firstName,
                lastName = signUpRequest.lastName
            )
            ResponseEntity.status(HttpStatus.CREATED).body(user)
        } catch (ex: Exception) {
            logger.error("Error during user sign-up: ", ex)
            ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null)
        }
    }
}
