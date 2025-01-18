package com.example.loka.server.controller

import com.example.loka.server.entity.Experience
import com.example.loka.server.service.ExperienceService
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/experiences")
class ExperienceController(private val service: ExperienceService) {

    @GetMapping
    fun getAllExperiences(): List<Experience> = service.findAll()

    @PostMapping
    fun createExperience(@RequestBody experience: Experience): Experience = service.save(experience)

    @GetMapping("/{id}")
    fun getExperienceById(@PathVariable id: Long): Experience = service.findById(id)

    @PutMapping("/{id}")
    fun updateExperience(@PathVariable id: Long, @RequestBody experience: Experience): Experience =
        service.update(id, experience)

    @DeleteMapping("/{id}")
    fun deleteExperience(@PathVariable id: Long) = service.delete(id)
}
