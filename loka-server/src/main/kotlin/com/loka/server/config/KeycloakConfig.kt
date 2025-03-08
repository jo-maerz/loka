package com.loka.server.config

import org.keycloak.OAuth2Constants
import org.keycloak.admin.client.Keycloak
import org.keycloak.admin.client.KeycloakBuilder
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

@Configuration
class KeycloakConfig(
        @Value("\${keycloak.auth-server-url}") private val authServerUrl: String,
        @Value("\${keycloak.admin-realm}")
        private val adminRealm: String, // Changed to separate admin realm
        @Value("\${keycloak.admin-client-id}") private val adminClientId: String,
        @Value("\${keycloak.admin-client-secret}") private val adminClientSecret: String
) {

    @Bean
    fun keycloak(): Keycloak {
        return KeycloakBuilder.builder()
                .serverUrl(authServerUrl)
                .realm(adminRealm) // Typically 'master' realm for admin operations
                .grantType(OAuth2Constants.CLIENT_CREDENTIALS)
                .clientId(adminClientId)
                .clientSecret(adminClientSecret)
                .build()
    }
}
