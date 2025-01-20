package com.loka.server.service

import com.loka.server.entity.Experience
import com.loka.server.repository.ExperienceRepository
import org.springframework.stereotype.Service
import java.time.Instant

@Service
class ExperienceService(private val repository: ExperienceRepository) {

    fun findAll(): List<Experience> = repository.findAll()

    fun findById(id: Long): Experience = repository.findById(id).orElseThrow { RuntimeException("Experience not found") }

    fun createExperience(experience: Experience): Experience {
    val now = Instant.now().toString()
    val experienceToSave = experience.copy(
        createdAt = now,
        updatedAt = now
    )
    return repository.save(experienceToSave)
}

    fun update(id: Long, updatedExperience: Experience): Experience {
        val existingExperience = repository.findById(id).orElseThrow {
            RuntimeException("Experience not found")
        }

        val newExperience = existingExperience.copy(
            name = updatedExperience.name,
            startDateTime = updatedExperience.startDateTime,
            endDateTime = updatedExperience.endDateTime,
            address = updatedExperience.address,
            position = updatedExperience.position,
            description = updatedExperience.description,
            hashtags = updatedExperience.hashtags,
            category = updatedExperience.category,
            pictures = updatedExperience.pictures,
            updatedAt = Instant.now().toString() // Update the timestamp
        )

        return repository.save(newExperience)
    }

    fun delete(id: Long) {
        if (repository.existsById(id)) repository.deleteById(id)
        else throw RuntimeException("Experience not found")
    }
}
