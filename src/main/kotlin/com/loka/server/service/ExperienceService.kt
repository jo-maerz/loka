package com.loka.server.service

import com.loka.server.entity.Experience
import com.loka.server.entity.ExperienceDTO
import com.loka.server.entity.Image
import com.loka.server.repository.ExperienceRepository
import org.springframework.security.core.Authentication
import org.springframework.stereotype.Service
import org.springframework.web.multipart.MultipartFile
import org.slf4j.LoggerFactory
import org.springframework.transaction.annotation.Transactional
import java.time.Instant

@Service
class ExperienceService(
    private val repository: ExperienceRepository
) {

    private val logger = LoggerFactory.getLogger(ExperienceService::class.java)

    fun findAll(): List<Experience> {
        return repository.findAll()
    }

    fun findById(id: Long): Experience? {
        return repository.findById(id).orElse(null)
    }

    @Transactional
    fun create(dto: ExperienceDTO, images: List<MultipartFile>?, authentication: Authentication): Experience {
        val currentTimestamp = Instant.now().toString() // Convert Instant to String
        val experience = Experience(
            name = dto.name,
            startDateTime = dto.startDateTime,
            endDateTime = dto.endDateTime,
            address = dto.address,
            position = dto.position,
            description = dto.description ?: "",
            hashtags = dto.hashtags ?: listOf(),
            category = dto.category,
            createdAt = currentTimestamp,
            updatedAt = currentTimestamp,
            createdBy = authentication.name
        )
        // Handle image storage if necessary
        images?.forEach { image ->
            try {
                val img = Image(fileName = image.originalFilename ?: "unknown", data = image.bytes, experience = experience)
                experience.images.add(img)
            } catch (ex: Exception) {
                logger.error("Error processing image: ", ex)
                // Handle exception as needed
            }
        }
        return repository.save(experience)
    }

    @Transactional
    fun update(id: Long, dto: ExperienceDTO, images: List<MultipartFile>?, authentication: Authentication): Experience? {
        val existing = repository.findById(id).orElse(null) ?: return null
        // Update fields
        existing.id = id
        existing.name = dto.name
        existing.startDateTime = dto.startDateTime
        existing.endDateTime = dto.endDateTime
        existing.address = dto.address
        existing.position = dto.position
        existing.description = dto.description ?: ""
        existing.hashtags = dto.hashtags ?: listOf()
        existing.updatedAt = Instant.now().toString() // Convert Instant to String
        // Handle image updates if necessary
        images?.forEach { image ->
            try {
                val img = Image(fileName = image.originalFilename ?: "unknown", data = image.bytes, experience = existing)
                existing.images.add(img)
            } catch (ex: Exception) {
                logger.error("Error processing image: ", ex)
                // Handle exception as needed
            }
        }
        return repository.save(existing)
    }

    @Transactional
    fun delete(id: Long): Boolean {
        return if (repository.existsById(id)) {
            repository.deleteById(id)
            true
        } else {
            false
        }
    }
}
