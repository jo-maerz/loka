package com.loka.server.controller

import com.loka.server.entity.Review
import com.loka.server.entity.ReviewDTO
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
    ): ResponseEntity<Review> {
        return try {
            val userKeycloakId =
                    authentication.name // Assuming authentication.name holds keycloakId
            val user =
                    reviewService.userRepository.findByKeycloakId(userKeycloakId).orElseThrow {
                        IllegalArgumentException("User not found")
                    }
            val review = reviewService.createReview(user.id, experienceId, reviewDTO)
            ResponseEntity.status(HttpStatus.CREATED).body(review)
        } catch (ex: Exception) {
            logger.error("Error creating review: ", ex)
            ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null)
        }
    }

    @GetMapping("/experiences/{experienceId}")
    fun getReviewsByExperience(@PathVariable experienceId: Long): ResponseEntity<List<Review>> {
        return try {
            val reviews = reviewService.getReviewsByExperience(experienceId)
            ResponseEntity.ok(reviews)
        } catch (ex: Exception) {
            logger.error("Error fetching reviews: ", ex)
            ResponseEntity.status(HttpStatus.BAD_REQUEST).body(emptyList())
        }
    }

    @PutMapping("/{reviewId}")
    @PreAuthorize("hasAuthority('ADMIN')")
    fun updateReview(
            @PathVariable reviewId: Long,
            @RequestBody @Valid reviewDTO: ReviewDTO
    ): ResponseEntity<Review> {
        return try {
            val updatedReview = reviewService.updateReview(reviewId, reviewDTO)
            ResponseEntity.ok(updatedReview)
        } catch (ex: Exception) {
            logger.error("Error updating review: ", ex)
            ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null)
        }
    }

    @DeleteMapping("/{reviewId}")
    @PreAuthorize("hasAuthority('ADMIN')")
    fun deleteReview(@PathVariable reviewId: Long): ResponseEntity<Void> {
        return try {
            reviewService.deleteReview(reviewId)
            ResponseEntity.noContent().build()
        } catch (ex: Exception) {
            logger.error("Error deleting review: ", ex)
            ResponseEntity.status(HttpStatus.BAD_REQUEST).build()
        }
    }
}
