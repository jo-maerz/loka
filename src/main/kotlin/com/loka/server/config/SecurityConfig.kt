package com.loka.server.config

import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.http.HttpMethod
import org.springframework.security.config.Customizer
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
import org.springframework.security.config.http.SessionCreationPolicy
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator
import org.springframework.security.oauth2.jwt.*
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter
import org.springframework.security.web.SecurityFilterChain

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
class SecurityConfig(private val jwtAuthenticationConverter: JwtAuthenticationConverter) {

    @Bean
    fun jwtDecoder(): JwtDecoder {
        val issuerUri = "http://localhost:8081/realms/loka-realm"
        val jwtDecoder: NimbusJwtDecoder = JwtDecoders.fromIssuerLocation(issuerUri)
        
        val validator = DelegatingOAuth2TokenValidator(
            JwtValidators.createDefaultWithIssuer(issuerUri),
            JwtTimestampValidator()
        )
        
        jwtDecoder.setJwtValidator(validator)
        return jwtDecoder
    }

    @Bean
    fun securityFilterChain(http: HttpSecurity): SecurityFilterChain {
        return http
            .csrf { it.disable() }
            .cors(Customizer.withDefaults())
            .authorizeHttpRequests { requests ->
                requests
                    .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                    .requestMatchers(HttpMethod.GET, "/api/experiences/**").permitAll()
                    .anyRequest().authenticated()
            }
            .oauth2ResourceServer { oauth2 ->
                oauth2.jwt { jwt ->
                    jwt.jwtAuthenticationConverter { token ->
                        try {
                            jwtAuthenticationConverter.convert(token)
                        } catch (ex: Exception) {
                            null
                        }
                    }
                }
            }
            .sessionManagement { session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            }
            .build()
    }
}