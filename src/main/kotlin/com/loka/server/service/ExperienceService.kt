package com.loka.server.service

import com.loka.server.entity.Experience
import com.loka.server.entity.ExperienceDTO
import com.loka.server.entity.Image
import com.loka.server.repository.ExperienceRepository
import org.springframework.security.access.AccessDeniedException
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.core.Authentication
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Service
import java.time.Instant
import org.springframework.web.multipart.MultipartFile

@Service
class ExperienceService(
    private val repository: ExperienceRepository
) {
    fun findAll(): List<Experience> = repository.findAll()

    fun findById(id: Long): Experience = repository.findById(id)
        .orElseThrow { RuntimeException("Experience not found") }

    fun create(dto: ExperienceDTO, files: List<MultipartFile>?): Experience {
        val authentication = SecurityContextHolder.getContext().authentication
        val now = Instant.now().toString()
        
        // Verify user has VERIFIED role
        if (authentication.authorities.none { it.authority == "ROLE_VERIFIED" }) {
            throw AccessDeniedException("Only verified users can create experiences")
        }

        val experience = dto.toEntity().apply {
            images = files?.map { it.toImageEntity() }?.toMutableList() ?: mutableListOf()
            createdAt = now
            updatedAt = now
        }
        
        return repository.save(experience)
    }

    @PreAuthorize("hasRole('ADMIN') or @experienceSecurity.isOwner(#id, authentication)")
    fun update(id: Long, dto: ExperienceDTO, files: List<MultipartFile>?): Experience {
        val existingExperience = repository.findById(id)
            .orElseThrow { RuntimeException("Experience not found") }

        // Update fields
       return existingExperience.apply {
            name = dto.name
            startDateTime = dto.startDateTime
            endDateTime = dto.endDateTime
            address = dto.address
            position = dto.position
            description = dto.description ?: ""
            hashtags = dto.hashtags ?: listOf()
            category = dto.category ?: ""
            updatedAt = Instant.now().toString()
            images = files?.map { it.toImageEntity() }?.toMutableList() ?: mutableListOf()
        }.let { repository.save(it) }
    }

    @PreAuthorize("hasRole('ADMIN') or @experienceSecurity.isOwner(#id, authentication)")
    fun delete(id: Long) {
        if (repository.existsById(id)) repository.deleteById(id)
        else throw RuntimeException("Experience not found")
    }

    private fun ExperienceDTO.toEntity() = Experience(
        name = this.name,
        startDateTime = this.startDateTime,
        endDateTime = this.endDateTime,
        address = this.address,
        position = this.position,
        description = this.description ?: "",
        hashtags = this.hashtags ?: listOf(),
        category = this.category ?: ""
    )

    private fun MultipartFile.toImageEntity() = Image(
        name = this.originalFilename ?: "unnamed",
        type = this.contentType ?: "application/octet-stream",
        imageData = this.bytes,
        experience = null
    )

}