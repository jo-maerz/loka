package com.loka.server.security

import com.loka.server.repository.ExperienceRepository
import org.springframework.security.core.Authentication
import org.springframework.stereotype.Component

@Component
class ExperienceSecurity(private val repository: ExperienceRepository) {
    fun isOwner(id: Long, authentication: Authentication): Boolean {
        val experience = repository.findById(id)
            .orElseThrow { RuntimeException("Experience not found") }
        return experience.createdBy == authentication.name?.trim()
    }
}