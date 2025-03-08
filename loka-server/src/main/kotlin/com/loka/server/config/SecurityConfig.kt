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
import org.springframework.web.cors.CorsConfiguration
import org.springframework.web.cors.UrlBasedCorsConfigurationSource

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
    fun corsConfigurationSource(): UrlBasedCorsConfigurationSource {
        val configuration =
                CorsConfiguration().apply {
                    allowedOrigins = listOf("http://localhost:4200") // Frontend URL
                    allowedMethods = listOf("GET", "POST", "PUT", "DELETE", "OPTIONS")
                    allowedHeaders = listOf("*")
                    allowCredentials = true
                }
        return UrlBasedCorsConfigurationSource().apply {
            registerCorsConfiguration("/**", configuration)
        }
    }

    @Bean
    fun securityFilterChain(http: HttpSecurity): SecurityFilterChain {
        http
                .csrf { it.disable() }
                .cors {} // Uses the corsConfigurationSource bean
                .sessionManagement { it.sessionCreationPolicy(SessionCreationPolicy.STATELESS) }
                .authorizeHttpRequests { authz ->
                    authz
                            // Permit signup and login endpoints
                            .requestMatchers("/api/auth/signup", "/api/auth/login")
                            .permitAll()
                            // Allow GET requests to experiences and reviews for everyone
                            .requestMatchers(HttpMethod.GET, "/api/experiences/**")
                            .permitAll()
                            .requestMatchers(HttpMethod.GET, "/api/reviews/**")
                            .permitAll()
                            // For posting experiences, only ADMIN or VERIFIED are allowed
                            .requestMatchers(HttpMethod.POST, "/api/experiences/**")
                            .hasAnyAuthority("ADMIN", "VERIFIED")
                            // For posting reviews, any authenticated user is allowed
                            .requestMatchers(HttpMethod.POST, "/api/reviews/**")
                            .authenticated()
                            // For updating (PUT/PATCH) and deleting, keep the restriction (you can
                            // adjust these as needed)
                            .requestMatchers(
                                    HttpMethod.PUT,
                                    "/api/experiences/**",
                                    "/api/reviews/**"
                            )
                            .hasAnyAuthority("ADMIN", "VERIFIED")
                            .requestMatchers(
                                    HttpMethod.PATCH,
                                    "/api/experiences/**",
                                    "/api/reviews/**"
                            )
                            .hasAnyAuthority("ADMIN", "VERIFIED")
                            .requestMatchers(
                                    HttpMethod.DELETE,
                                    "/api/experiences/**",
                                    "/api/reviews/**"
                            )
                            .hasAnyAuthority("ADMIN", "VERIFIED")
                            .anyRequest()
                            .authenticated()
                }
                .oauth2ResourceServer { oauth2 ->
                    oauth2.jwt { it.jwtAuthenticationConverter(jwtAuthenticationConverter) }
                }

        return http.build()
    }
}
