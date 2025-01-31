package com.loka.server.config

import java.util.Optional
import org.springframework.data.domain.AuditorAware
import org.springframework.security.core.Authentication
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Component

@Component
class AuditorAwareImpl : AuditorAware<String> {
    override fun getCurrentAuditor(): Optional<String> {
        val authentication: Authentication? = SecurityContextHolder.getContext().authentication
        return if (authentication != null && authentication.isAuthenticated) {
            Optional.of(authentication.name)
        } else {
            Optional.empty()
        }
    }
}
