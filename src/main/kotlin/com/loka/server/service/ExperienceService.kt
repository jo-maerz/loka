package com.loka.server.service

import com.loka.server.entity.Experience
import com.loka.server.repository.ExperienceRepository
import org.springframework.security.access.AccessDeniedException
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.core.Authentication
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Service
import java.time.Instant

@Service
class ExperienceService(
    private val repository: ExperienceRepository
) {
    fun findAll(): List<Experience> = repository.findAll()

    fun findById(id: Long): Experience = repository.findById(id)
        .orElseThrow { RuntimeException("Experience not found") }

    fun createExperience(experience: Experience): Experience {
        val authentication = SecurityContextHolder.getContext().authentication
        val now = Instant.now().toString()
        
        // Verify user has VERIFIED role
        if (authentication.authorities.none { it.authority == "ROLE_VERIFIED" }) {
            throw AccessDeniedException("Only verified users can create experiences")
        }

        return repository.save(experience.copy(
            createdAt = now,
            updatedAt = now,
            createdBy = authentication.name // Store creator ID
        ))
    }

    @PreAuthorize("hasRole('ADMIN') or @experienceSecurity.isOwner(#id, authentication)")
    fun update(id: Long, updatedExperience: Experience): Experience {
        val existingExperience = repository.findById(id)
            .orElseThrow { RuntimeException("Experience not found") }

        return repository.save(existingExperience.copy(
            name = updatedExperience.name,
            startDateTime = updatedExperience.startDateTime,
            endDateTime = updatedExperience.endDateTime,
            address = updatedExperience.address,
            position = updatedExperience.position,
            description = updatedExperience.description,
            hashtags = updatedExperience.hashtags,
            category = updatedExperience.category,
            pictures = updatedExperience.pictures,
            updatedAt = Instant.now().toString()
        ))
    }

    @PreAuthorize("hasRole('ADMIN') or @experienceSecurity.isOwner(#id, authentication)")
    fun delete(id: Long) {
        if (repository.existsById(id)) repository.deleteById(id)
        else throw RuntimeException("Experience not found")
    }
}