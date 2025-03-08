package com.loka.server.controller

import com.loka.server.entity.ReviewDTO
import com.loka.server.entity.ReviewResponseDTO
import com.loka.server.entity.toReviewResponseDTO
import com.loka.server.service.ReviewService
import jakarta.validation.Valid
import org.slf4j.LoggerFactory
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/reviews")
class ReviewController(private val reviewService: ReviewService) {
    private val logger = LoggerFactory.getLogger(ReviewController::class.java)

    @PostMapping("/experiences/{experienceId}")
    fun createReview(
            @PathVariable experienceId: Long,
            @RequestBody @Valid reviewDTO: ReviewDTO,
            authentication: Authentication
    ): ResponseEntity<ReviewResponseDTO> {
        return try {
            val userKeycloakId = authentication.name
            // Look up the user by keycloakId (this repository is public on ReviewService)
            val user =
                    reviewService.userRepository.findByKeycloakId(userKeycloakId).orElseThrow {
                        IllegalArgumentException("User not found")
                    }
            val review =
                    reviewService.createReview(user.id, experienceId, reviewDTO, authentication)
            ResponseEntity.status(HttpStatus.CREATED).body(toReviewResponseDTO(review))
        } catch (ex: Exception) {
            logger.error("Error creating review: ", ex)
            ResponseEntity.status(HttpStatus.BAD_REQUEST).build()
        }
    }

    @GetMapping("/experiences/{experienceId}")
    fun getReviewsByExperience(
            @PathVariable experienceId: Long
    ): ResponseEntity<List<ReviewResponseDTO>> {
        return try {
            val reviews = reviewService.getReviewsByExperience(experienceId)
            ResponseEntity.ok(reviews.map { toReviewResponseDTO(it) })
        } catch (ex: Exception) {
            logger.error("Error fetching reviews: ", ex)
            ResponseEntity.status(HttpStatus.BAD_REQUEST).body(emptyList())
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize(
            "hasAnyAuthority('ADMIN', 'VERIFIED') and @reviewSecurity.isOwner(#id, authentication)"
    )
    fun updateReview(
            @PathVariable id: Long,
            @RequestBody @Valid reviewDTO: ReviewDTO
    ): ResponseEntity<ReviewResponseDTO> {
        return try {
            val updatedReview = reviewService.updateReview(id, reviewDTO)
            ResponseEntity.ok(toReviewResponseDTO(updatedReview))
        } catch (ex: Exception) {
            logger.error("Error updating review: ", ex)
            ResponseEntity.status(HttpStatus.BAD_REQUEST).build()
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize(
            "hasAnyAuthority('ADMIN', 'VERIFIED') and @reviewSecurity.isOwner(#id, authentication)"
    )
    fun deleteReview(@PathVariable id: Long): ResponseEntity<Void> {
        return try {
            reviewService.deleteReview(id)
            ResponseEntity.noContent().build()
        } catch (ex: Exception) {
            logger.error("Error deleting review: ", ex)
            ResponseEntity.status(HttpStatus.BAD_REQUEST).build()
        }
    }
}
