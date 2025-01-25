package com.loka.server.config

import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.http.HttpMethod
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
import org.springframework.security.config.http.SessionCreationPolicy
import org.springframework.security.oauth2.jwt.JwtDecoder
import org.springframework.security.oauth2.jwt.JwtDecoders
import org.springframework.security.oauth2.jwt.JwtValidators
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter
import org.springframework.security.web.SecurityFilterChain

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
class SecurityConfig(private val jwtAuthenticationConverter: JwtAuthenticationConverter) {

    @Bean
    fun jwtDecoder(): JwtDecoder {
        val issuerUri = "http://localhost:8081/realms/loka-realm"
        val jwtDecoder = JwtDecoders.fromIssuerLocation(issuerUri) as NimbusJwtDecoder

        val validator = JwtValidators.createDefaultWithIssuer(issuerUri)
        jwtDecoder.setJwtValidator(validator)
        return jwtDecoder
    }

    @Bean
    fun securityFilterChain(http: HttpSecurity): SecurityFilterChain {
        http
            // Disable CSRF for APIs
            .csrf { csrf ->
                csrf.disable()
            }
            // Configure CORS
            .cors { cors ->
                cors.configurationSource { request ->
                    val config = org.springframework.web.cors.CorsConfiguration()
                    config.allowedOrigins = listOf("http://localhost:4200") // Frontend URL
                    config.allowedMethods = listOf("GET", "POST", "PUT", "DELETE", "OPTIONS")
                    config.allowedHeaders = listOf("*")
                    config.allowCredentials = true
                    config
                }
            }
            // Configure session management as stateless
            .sessionManagement { session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            }
            // Configure authorization
            .authorizeHttpRequests { authz ->
                authz
                    // Permit all for sign-up and login endpoints
                    .requestMatchers("/api/auth/signup", "/api/auth/login").permitAll()
                    // Permit all GET requests to experiences
                    .requestMatchers(HttpMethod.GET, "/api/experiences/**").permitAll()
                    // Restrict POST requests to ADMIN and VERIFIED roles
                    .requestMatchers(HttpMethod.POST, "/api/experiences/**").hasAnyAuthority("ADMIN", "VERIFIED")
                    // Restrict PUT, PATCH, DELETE requests to ADMIN and VERIFIED roles
                    .requestMatchers(HttpMethod.PUT, "/api/experiences/**").hasAnyAuthority("ADMIN", "VERIFIED")
                    .requestMatchers(HttpMethod.PATCH, "/api/experiences/**").hasAnyAuthority("ADMIN", "VERIFIED")
                    .requestMatchers(HttpMethod.DELETE, "/api/experiences/**").hasAnyAuthority("ADMIN", "VERIFIED")
                    // All other requests require authentication
                    .anyRequest().authenticated()
            }
            // Configure OAuth2 Resource Server to use JWT with custom converter
            .oauth2ResourceServer { oauth2 ->
                oauth2
                    .jwt { jwt ->
                        jwt.jwtAuthenticationConverter(jwtAuthenticationConverter)
                    }
            }

        return http.build()
    }
}
