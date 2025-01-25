package com.loka.server.service

import com.loka.server.entity.User
import com.loka.server.repository.UserRepository
import org.keycloak.admin.client.Keycloak
import org.keycloak.representations.idm.CredentialRepresentation
import org.keycloak.representations.idm.UserRepresentation
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.beans.factory.annotation.Value

@Service
class UserService(
    private val userRepository: UserRepository,
    private val keycloak: Keycloak // Injected Keycloak bean
) {
    private val logger = LoggerFactory.getLogger(UserService::class.java)

    @Value("\${keycloak.realm}")
    private lateinit var targetRealm: String // The realm where users will be created

    /**
     * Registers a new user in Keycloak and the application database.
     */
    @Transactional
    fun registerUser(
        email: String,
        password: String,
        firstName: String,
        lastName: String
    ): User {
        // Check if user already exists in the database
        if (userRepository.findByEmail(email).isPresent) {
            throw IllegalArgumentException("User with email $email already exists.")
        }

        // Create Keycloak user representation
        val userRepresentation = UserRepresentation().apply {
            this.username = email
            this.email = email
            this.firstName = firstName
            this.lastName = lastName
            this.isEnabled = true
            this.isEmailVerified = true

            // Set credentials
            this.credentials = listOf(createPasswordCredential(password))
        }

        // Create the user in Keycloak
        val response = keycloak.realm(targetRealm).users().create(userRepresentation)

        if (response.status != 201) {
            throw RuntimeException("Failed to create user in Keycloak: ${response.status}")
        }

        // Get the created user's ID from the response
        val createdUserId = response.location.path.split("/").last()

        // Save the user in the application database
        return userRepository.save(
            User(
                keycloakId = createdUserId,
                email = email,
                firstName = firstName,
                lastName = lastName
            )
        )
    }

    /**
     * Creates a password credential representation.
     */
    private fun createPasswordCredential(password: String): CredentialRepresentation {
        return CredentialRepresentation().apply {
            this.type = CredentialRepresentation.PASSWORD
            this.value = password
            this.isTemporary = false
        }
    }
}
