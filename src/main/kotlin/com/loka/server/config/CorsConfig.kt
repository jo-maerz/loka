package com.loka.server.config

import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.web.cors.CorsConfiguration
import org.springframework.web.cors.CorsConfigurationSource
import org.springframework.web.cors.UrlBasedCorsConfigurationSource

@Configuration
class CorsConfig {

    @Bean
    fun corsConfigurationSource(): CorsConfigurationSource {
        val config = CorsConfiguration().apply {
            allowedOriginPatterns = listOf(
                "http://localhost:4200",  // Angular dev server
                "http://localhost:[*]"    // Wildcard for any localhost port
            )
            allowedMethods = listOf("GET", "POST", "PUT", "DELETE", "OPTIONS")
            allowedHeaders = listOf(
                "Authorization", 
                "Content-Type", 
                "Cache-Control",
                "X-Requested-With"
            )
            exposedHeaders = listOf("Authorization", "Content-Length")
            allowCredentials = true
            maxAge = 3600L  // 1 hour cache
        }

        val source = UrlBasedCorsConfigurationSource()
        source.registerCorsConfiguration("/**", config)
        return source
    }
}