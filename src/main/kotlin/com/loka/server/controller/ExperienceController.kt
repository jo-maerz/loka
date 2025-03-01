package com.loka.server.controller

import com.loka.server.entity.Experience
import com.loka.server.entity.ExperienceDTO
import com.loka.server.service.ExperienceService
import jakarta.validation.Valid
import java.time.OffsetDateTime
import org.slf4j.LoggerFactory
import org.springframework.format.annotation.DateTimeFormat
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.*
import org.springframework.web.multipart.MultipartFile

@RestController
@RequestMapping("/api/experiences")
class ExperienceController(private val service: ExperienceService) {

    private val logger = LoggerFactory.getLogger(ExperienceController::class.java)

    @GetMapping
    fun getAllExperiences(): ResponseEntity<List<Experience>> {
        val experiences = service.findAll()
        return ResponseEntity.ok(experiences)
    }

    @GetMapping("/search")
    fun getExperiencesFiltered(
            @RequestParam(required = false) city: String?,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            startDateTime: OffsetDateTime?,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            endDateTime: OffsetDateTime?,
            @RequestParam(required = false) category: String?
    ): ResponseEntity<List<Experience>> {
        val filtered = service.findFiltered(city, startDateTime, endDateTime, category)
        return ResponseEntity.ok(filtered)
    }

    @GetMapping("/{id}")
    fun getExperienceById(@PathVariable id: Long): ResponseEntity<Experience> {
        val experience = service.findById(id)
        return if (experience != null) ResponseEntity.ok(experience)
        else ResponseEntity.notFound().build()
    }

    @PostMapping(consumes = [MediaType.MULTIPART_FORM_DATA_VALUE])
    @PreAuthorize("hasAnyAuthority('ADMIN', 'VERIFIED')")
    fun createExperience(
            @RequestPart("experience") @Valid dto: ExperienceDTO,
            @RequestPart(value = "images", required = false) images: List<MultipartFile>? = null,
            authentication: Authentication
    ): ResponseEntity<Experience> {
        return try {
            val createdExperience = service.create(dto, images, authentication)
            ResponseEntity.status(201).body(createdExperience)
        } catch (ex: Exception) {
            logger.error("Error creating experience: ", ex)
            ResponseEntity.badRequest().build()
        }
    }

    @PutMapping("/{id}", consumes = [MediaType.MULTIPART_FORM_DATA_VALUE])
    @PreAuthorize(
            "hasAnyAuthority('ADMIN', 'VERIFIED') and @experienceSecurity.isOwner(#id, authentication)"
    )
    fun updateExperience(
            @PathVariable id: Long,
            @RequestPart("experience") @Valid dto: ExperienceDTO,
            @RequestPart(value = "images", required = false) images: List<MultipartFile>? = null,
            authentication: Authentication
    ): ResponseEntity<Experience> {
        return try {
            val updatedExperience = service.update(id, dto, images, authentication)
            if (updatedExperience != null) ResponseEntity.ok(updatedExperience)
            else ResponseEntity.notFound().build()
        } catch (ex: Exception) {
            logger.error("Error updating experience: ", ex)
            ResponseEntity.badRequest().build()
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize(
            "hasAnyAuthority('ADMIN', 'VERIFIED') and @experienceSecurity.isOwner(#id, authentication)"
    )
    fun deleteExperience(@PathVariable id: Long): ResponseEntity<Void> {
        return try {
            val deleted = service.delete(id)
            if (deleted) ResponseEntity.noContent().build() else ResponseEntity.notFound().build()
        } catch (ex: Exception) {
            logger.error("Error deleting experience: ", ex)
            ResponseEntity.badRequest().build()
        }
    }
}
