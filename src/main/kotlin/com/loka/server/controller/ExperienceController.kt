package com.loka.server.controller

import com.loka.server.entity.Experience
import com.loka.server.entity.ExperienceDTO
import com.loka.server.service.ExperienceService
import org.springframework.web.bind.annotation.*
import com.fasterxml.jackson.core.JsonProcessingException
import org.springframework.http.HttpHeaders
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.web.multipart.MultipartFile
import com.fasterxml.jackson.databind.ObjectMapper
import org.springframework.beans.factory.annotation.Autowired

@RestController
@RequestMapping("/api/experiences")
class ExperienceController(private val service: ExperienceService,  @Autowired private val objectMapper: ObjectMapper) {

    @GetMapping
    fun getAllExperiences(): List<Experience> = service.findAll()

    @PostMapping(consumes = [MediaType.MULTIPART_FORM_DATA_VALUE])
    fun createExperience(
        @RequestPart("experience") experienceJson: String,
        @RequestPart("images") images: List<MultipartFile>?
    ): ResponseEntity<Experience> {
        val dto = objectMapper.readValue(experienceJson, ExperienceDTO::class.java)
        return ResponseEntity.ok(service.create(dto, images))
    }

    @GetMapping("/{id}")
    fun getExperienceById(@PathVariable id: Long): Experience = service.findById(id)

    @PutMapping("/{id}", consumes = [MediaType.MULTIPART_FORM_DATA_VALUE])
    fun updateExperience(
        @PathVariable id: Long,
        @RequestPart("experience") experienceJson: String,
        @RequestPart("images") images: List<MultipartFile>?
    ): ResponseEntity<Experience> {
        val dto = objectMapper.readValue(experienceJson, ExperienceDTO::class.java)
        return ResponseEntity.ok(service.update(id, dto, images))
    }

    @DeleteMapping("/{id}")
    fun deleteExperience(@PathVariable id: Long) = service.delete(id)
}
