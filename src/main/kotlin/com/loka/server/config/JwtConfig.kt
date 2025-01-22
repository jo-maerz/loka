package com.loka.server.config

import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.core.convert.converter.Converter
import org.springframework.security.core.GrantedAuthority
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter

@Configuration
class JwtConfig {
    @Bean
    fun jwtAuthenticationConverter(): JwtAuthenticationConverter {
        val converter = JwtAuthenticationConverter()
        converter.setJwtGrantedAuthoritiesConverter(JwtGrantedAuthoritiesConverter())
        return converter
    }
}

class JwtGrantedAuthoritiesConverter : Converter<Jwt, Collection<GrantedAuthority>> {
    override fun convert(jwt: Jwt): Collection<GrantedAuthority> {
        val realmAccess = jwt.claims["realm_access"] as? Map<String, Any>
        val roles = (realmAccess?.get("roles") as? List<String> ?: emptyList())
            .map { it.removePrefix("ROLE_") } // Remove existing ROLE_ prefix
            .map { SimpleGrantedAuthority("ROLE_$it") }
        return roles
    }
}