package com.loka.server.listener

import com.loka.server.entity.User
import com.loka.server.repository.UserRepository
import org.slf4j.LoggerFactory
import org.springframework.context.event.EventListener
import org.springframework.security.authentication.event.AuthenticationSuccessEvent
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.stereotype.Component

@Component
class AuthListener(private val userRepository: UserRepository) {
    private val logger = LoggerFactory.getLogger(AuthListener::class.java)

    @EventListener
    fun handleAuthenticationSuccess(event: AuthenticationSuccessEvent) {
        val authentication = event.authentication

        // Check if the principal is a Jwt
        if (authentication.principal is Jwt) {
            val jwt = authentication.principal as Jwt

            // Extract keycloakId and email from JWT claims
            val keycloakId = jwt.subject // Typically the unique identifier
            val email = jwt.getClaimAsString("email")

            logger.debug("Authenticated user - Keycloak ID: $keycloakId, Email: $email")

            // Check if the user already exists
            if (!userRepository.findByKeycloakId(keycloakId).isPresent) {
                // Create and save a new user
                val newUser =
                        User(
                                keycloakId = keycloakId,
                                email = email
                                                ?: throw IllegalArgumentException(
                                                        "Email claim is missing in JWT"
                                                ),
                                firstName = jwt.getClaimAsString("given_name") ?: "FirstName",
                                lastName = jwt.getClaimAsString("family_name") ?: "LastName"
                        )
                userRepository.save(newUser)
                logger.info("New user created: $email")
            } else {
                logger.debug("User already exists: $email")
            }
        } else {
            logger.warn(
                    "Authentication principal is not of type Jwt. Actual type: ${authentication.principal::class.java}"
            )
        }
    }
}
