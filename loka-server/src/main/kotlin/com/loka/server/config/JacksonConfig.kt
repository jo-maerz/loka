package com.loka.server.config

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.databind.SerializationFeature
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule
import com.fasterxml.jackson.module.kotlin.KotlinModule
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

@Configuration
class JacksonConfig {
    @Bean
    fun objectMapper(): ObjectMapper {
        return ObjectMapper().apply {
            registerModules(
                    KotlinModule.Builder().build(),
                    JavaTimeModule()
                    // Add more modules as needed
                    )
            disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS)
        }
    }
}
