package com.loka.server.service

import com.loka.server.entity.Experience
import com.loka.server.entity.ExperienceDTO
import com.loka.server.entity.Image
import com.loka.server.repository.ExperienceRepository
import org.springframework.stereotype.Service
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.multipart.MultipartFile
import java.time.Instant

@Service
class ExperienceService(
    private val repository: ExperienceRepository
) {
    fun findAll(): List<Experience> = repository.findAll()

    fun findById(id: Long): Experience =
        repository.findById(id).orElseThrow { RuntimeException("Experience not found") }

    @PreAuthorize("hasAuthority('VERIFIED')")
    fun create(dto: ExperienceDTO, files: List<MultipartFile>?): Experience {
        val now = Instant.now().toString()

        val experience = dto.toEntity().apply {
            createdAt = now
            updatedAt = now
            images = files?.map { it.toImageEntity() }?.toMutableList() ?: mutableListOf()
            createdBy = SecurityContextHolder.getContext().authentication.name;
        }

        return repository.save(experience)
    }

    @PreAuthorize("hasAuthority('ADMIN') or @experienceSecurity.isOwner(#id, authentication)")
    fun update(id: Long, dto: ExperienceDTO, files: List<MultipartFile>?): Experience {
        val existing = repository.findById(id)
            .orElseThrow { RuntimeException("Experience not found") }

        return existing.apply {
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

    @PreAuthorize("hasAuthority('ADMIN') or @experienceSecurity.isOwner(#id, authentication)")
    fun delete(id: Long) {
        if (!repository.existsById(id)) throw RuntimeException("Experience not found")
        repository.deleteById(id)
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
