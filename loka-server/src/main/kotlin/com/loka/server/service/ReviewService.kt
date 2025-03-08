package com.loka.server.service

import com.loka.server.entity.Review
import com.loka.server.entity.ReviewDTO
import com.loka.server.repository.ExperienceRepository
import com.loka.server.repository.ReviewRepository
import com.loka.server.repository.UserRepository
import java.time.Instant
import org.slf4j.LoggerFactory
import org.springframework.security.core.Authentication
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class ReviewService(
        private val reviewRepository: ReviewRepository,
        val userRepository: UserRepository,
        private val experienceRepository: ExperienceRepository
) {
    private val logger = LoggerFactory.getLogger(ReviewService::class.java)

    /** Creates a new review for an experience by a user. */
    @Transactional
    fun createReview(
            userId: Long,
            experienceId: Long,
            dto: ReviewDTO,
            authentication: Authentication
    ): Review {
        val user =
                userRepository.findById(userId).orElseThrow {
                    IllegalArgumentException("User not found")
                }

        val experience =
                experienceRepository.findById(experienceId).orElseThrow {
                    IllegalArgumentException("Experience not found")
                }

        // Prevent creators from reviewing their own experience
        if (experience.createdBy == user.keycloakId) {
            throw IllegalArgumentException("Creators cannot review their own experiences.")
        }

        // Check if the user has already reviewed this experience
        if (reviewRepository.findByUserAndExperience(user, experience).isPresent) {
            throw IllegalArgumentException("User has already reviewed this experience.")
        }

        val review =
                Review(
                        stars = dto.stars,
                        text = dto.text,
                        user = user,
                        experience = experience,
                        createdAt = Instant.now().toString(),
                        updatedAt = Instant.now().toString(),
                        createdBy = authentication.name
                )

        return reviewRepository.save(review)
    }

    /** Retrieves all reviews for a given experience. */
    fun getReviewsByExperience(experienceId: Long): List<Review> {
        val experience =
                experienceRepository.findById(experienceId).orElseThrow {
                    IllegalArgumentException("Experience not found")
                }
        return reviewRepository.findByExperience(experience)
    }

    fun getReviewById(id: Long): Review? {
        return reviewRepository.findById(id).orElse(null)
    }

    /** Updates an existing review. Only admins can perform this action. */
    @Transactional
    fun updateReview(reviewId: Long, dto: ReviewDTO): Review {
        val review =
                reviewRepository.findById(reviewId).orElseThrow {
                    IllegalArgumentException("Review not found")
                }

        review.stars = dto.stars
        review.text = dto.text
        review.updatedAt = Instant.now().toString()

        return reviewRepository.save(review)
    }

    /** Deletes a review. Only admins can perform this action. */
    @Transactional
    fun deleteReview(reviewId: Long) {
        if (!reviewRepository.existsById(reviewId)) {
            throw IllegalArgumentException("Review not found")
        }
        reviewRepository.deleteById(reviewId)
    }
}
