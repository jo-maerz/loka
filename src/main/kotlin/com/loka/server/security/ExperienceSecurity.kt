package com.loka.server.security

import com.loka.server.service.ExperienceService
import org.springframework.security.core.Authentication
import org.springframework.stereotype.Component

@Component("experienceSecurity")
class ExperienceSecurity(private val experienceService: ExperienceService) {

    /**
     * Checks if the authenticated user is the owner of the experience with the given ID.
     *
     * @param experienceId The ID of the experience.
     * @param authentication The authentication object containing user details.
     * @return true if the user is the owner or has ADMIN role, false otherwise.
     */
    fun isOwner(experienceId: Long, authentication: Authentication): Boolean {
        val experience = experienceService.findById(experienceId) ?: return false
        val currentUsername = authentication.name
        val isAdmin = authentication.authorities.any { it.authority == "ADMIN" }
        return isAdmin || (experience.createdBy == currentUsername)
    }
}
