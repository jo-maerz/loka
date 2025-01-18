package com.example.loka.server.service

import com.example.loka.server.entity.Experience
import com.example.loka.server.repository.ExperienceRepository
import org.springframework.stereotype.Service

@Service
class ExperienceService(private val repository: ExperienceRepository) {

    fun findAll(): List<Experience> = repository.findAll()

    fun findById(id: Long): Experience = repository.findById(id).orElseThrow { RuntimeException("Experience not found") }

    fun save(experience: Experience): Experience = repository.save(experience)

    fun update(id: Long, updatedExperience: Experience): Experience {
        return repository.findById(id).map {
            val newExperience = it.copy(
                name = updatedExperience.name,
                location = updatedExperience.location,
                date = updatedExperience.date
            )
            repository.save(newExperience)
        }.orElseThrow { RuntimeException("Experience not found") }
    }

    fun delete(id: Long) {
        if (repository.existsById(id)) repository.deleteById(id)
        else throw RuntimeException("Experience not found")
    }
}
