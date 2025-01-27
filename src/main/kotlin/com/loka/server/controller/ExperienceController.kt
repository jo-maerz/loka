package com.loka.server.controller

import com.loka.server.entity.Experience
import com.loka.server.entity.ExperienceDTO
import com.loka.server.service.ExperienceService
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*
import com.fasterxml.jackson.databind.ObjectMapper
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.web.multipart.MultipartFile
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.security.core.Authentication
import jakarta.validation.Valid

@RestController
@RequestMapping("/api/experiences")
class ExperienceController(
    private val service: ExperienceService,
    @Autowired private val objectMapper: ObjectMapper
) {
    private val logger = LoggerFactory.getLogger(ExperienceController::class.java)

    @GetMapping
    fun getAllExperiences(): ResponseEntity<List<Experience>> {
        val experiences = service.findAll()
        return ResponseEntity.ok(experiences)
    }

    @GetMapping("/{id}")
    fun getExperienceById(@PathVariable id: Long): ResponseEntity<Experience> {
        val experience = service.findById(id)
        return if (experience != null) {
            ResponseEntity.ok(experience)
        } else {
            ResponseEntity.notFound().build()
        }
    }

    /**
     * Create a new experience with optional images.
     */
    @PostMapping(consumes = [MediaType.MULTIPART_FORM_DATA_VALUE])
    @PreAuthorize("hasAnyAuthority('ADMIN', 'VERIFIED')")
    fun createExperience(
        @RequestPart("experience") @Valid experienceJson: String,
        @RequestPart(value = "images", required = false) images: List<MultipartFile>? = null,
        authentication: Authentication
    ): ResponseEntity<Experience> {
        return try {
            val dto = objectMapper.readValue(experienceJson, ExperienceDTO::class.java)
            val createdExperience = service.create(dto, images, authentication)
            ResponseEntity.status(201).body(createdExperience)
        } catch (ex: Exception) {
            logger.error("Error creating experience: ", ex)
            ResponseEntity.badRequest().build()
        }
    }

    @PutMapping("/{id}", consumes = [MediaType.MULTIPART_FORM_DATA_VALUE])
    @PreAuthorize("hasAnyAuthority('ADMIN', 'VERIFIED') and @experienceSecurity.isOwner(#id, authentication)")
    fun updateExperience(
        @PathVariable id: Long,
        @RequestPart("experience") @Valid experienceJson: String,
        @RequestPart(value = "images", required = false) images: List<MultipartFile>? = null,
        authentication: Authentication
    ): ResponseEntity<Experience> {
        return try {
            val dto = objectMapper.readValue(experienceJson, ExperienceDTO::class.java)
            val updatedExperience = service.update(id, dto, images, authentication)
            if (updatedExperience != null) {
                ResponseEntity.ok(updatedExperience)
            } else {
                ResponseEntity.notFound().build()
            }
        } catch (ex: Exception) {
            logger.error("Error updating experience: ", ex)
            ResponseEntity.badRequest().build()
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'VERIFIED') and @experienceSecurity.isOwner(#id, authentication)")
    fun deleteExperience(@PathVariable id: Long): ResponseEntity<Void> {
        return try {
            val deleted = service.delete(id)
            if (deleted) {
                ResponseEntity.noContent().build()
            } else {
                ResponseEntity.notFound().build()
            }
        } catch (ex: Exception) {
            logger.error("Error deleting experience: ", ex)
            ResponseEntity.badRequest().build()
        }
    }
}