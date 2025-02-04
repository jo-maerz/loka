package com.loka.server.service

import com.amazonaws.services.s3.AmazonS3
import com.amazonaws.services.s3.model.ObjectMetadata
import com.loka.server.entity.Experience
import com.loka.server.entity.ExperienceDTO
import com.loka.server.entity.Image
import com.loka.server.repository.ExperienceRepository
import com.loka.server.repository.ImageRepository
import java.time.Instant
import org.slf4j.LoggerFactory
import org.springframework.security.core.Authentication
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.multipart.MultipartFile

@Service
class ExperienceService(
        private val repository: ExperienceRepository,
        private val imageRepository: ImageRepository,
        private val s3Client: AmazonS3 // Injected from MinioConfig
) {

    private val logger = LoggerFactory.getLogger(ExperienceService::class.java)

    private val bucketName = "my-bucket"

    fun findAll(): List<Experience> {
        return repository.findAll()
    }

    fun findById(id: Long): Experience? {
        return repository.findById(id).orElse(null)
    }

    @Transactional
    fun create(
            dto: ExperienceDTO,
            images: List<MultipartFile>?,
            authentication: Authentication
    ): Experience {
        val now = Instant.now().toString()
        // Create an experience entity (without images yet)
        var experience =
                Experience(
                        name = dto.name,
                        startDateTime = dto.startDateTime,
                        endDateTime = dto.endDateTime,
                        address = dto.address,
                        position = dto.position,
                        description = dto.description ?: "",
                        hashtags = dto.hashtags ?: listOf(),
                        category = dto.category,
                        createdAt = now,
                        updatedAt = now,
                        createdBy = authentication.name
                )

        // Save initially to generate an ID
        experience = repository.save(experience)

        images?.forEach { multipartFile ->
            val originalFilename =
                    multipartFile.originalFilename ?: "unknown-${System.currentTimeMillis()}"
            val cleanFilename = originalFilename.replace("[^A-Za-z0-9._-]".toRegex(), "_")

            val objectKey = "experiences/${experience.id}/$cleanFilename"
            // Prepare metadata (e.g. content length and type)
            val metadata =
                    ObjectMetadata().apply {
                        contentLength = multipartFile.size
                        contentType = multipartFile.contentType
                    }
            // Upload file using the input stream (no temporary file needed)
            s3Client.putObject(bucketName, objectKey, multipartFile.inputStream, metadata)
            val fileUrl = s3Client.getUrl(bucketName, objectKey).toString()

            // Create an Image entity and add it to the experience
            val imageEntity =
                    Image(fileName = cleanFilename, filePath = fileUrl, experience = experience)
            experience.images.add(imageEntity)

            logger.info("Uploaded $cleanFilename to S3 at $fileUrl")
        }

        return repository.save(experience)
    }

    @Transactional
    fun update(
            id: Long,
            dto: ExperienceDTO,
            images: List<MultipartFile>?,
            authentication: Authentication
    ): Experience? {
        val existing = repository.findById(id).orElse(null) ?: return null

        existing.name = dto.name
        existing.startDateTime = dto.startDateTime
        existing.endDateTime = dto.endDateTime
        existing.address = dto.address
        existing.position = dto.position
        existing.description = dto.description ?: ""
        existing.hashtags = dto.hashtags ?: listOf()
        existing.updatedAt = Instant.now().toString()

        images?.forEach { multipartFile ->
            val originalFilename =
                    multipartFile.originalFilename ?: "unknown-${System.currentTimeMillis()}"
            val cleanFilename = originalFilename.replace("[^A-Za-z0-9._-]".toRegex(), "_")

            val objectKey = "experiences/${existing.id}/$cleanFilename"
            val metadata =
                    ObjectMetadata().apply {
                        contentLength = multipartFile.size
                        contentType = multipartFile.contentType
                    }
            s3Client.putObject(bucketName, objectKey, multipartFile.inputStream, metadata)
            val fileUrl = s3Client.getUrl(bucketName, objectKey).toString()

            val imageEntity =
                    Image(fileName = cleanFilename, filePath = fileUrl, experience = existing)
            existing.images.add(imageEntity)

            logger.info("Uploaded $cleanFilename to S3 at $fileUrl")
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
