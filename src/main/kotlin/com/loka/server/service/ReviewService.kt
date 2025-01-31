package com.loka.server.service

import com.loka.server.entity.Review
import com.loka.server.repository.ExperienceRepository
import com.loka.server.repository.ReviewRepository
import com.loka.server.repository.UserRepository
import java.time.LocalDateTime
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class ReviewService(
        private val reviewRepository: ReviewRepository,
        private val experienceRepository: ExperienceRepository,
        private val userRepository: UserRepository
) {

    @Transactional
    fun createReview(userId: Long, experienceId: Long, rating: Int, description: String): Review {
        val user =
                userRepository.findById(userId).orElseThrow {
                    IllegalArgumentException("User not found with ID: $userId")
                }

        val experience =
                experienceRepository.findById(experienceId).orElseThrow {
                    IllegalArgumentException("Experience not found with ID: $experienceId")
                }

        // Check if the user has already reviewed this experience
        if (reviewRepository.findByUserAndExperience(user, experience).isPresent) {
            throw IllegalArgumentException("User has already reviewed this experience.")
        }

        // Validate rating
        if (rating !in 1..5) {
            throw IllegalArgumentException("Rating must be between 1 and 5.")
        }

        val review =
                Review(
                        user = user,
                        experience = experience,
                        reviewDate = LocalDateTime.now(),
                        rating = rating,
                        description = description
                )

        return reviewRepository.save(review)
    }

    fun getReviewById(reviewId: Long): Review {
        return reviewRepository.findById(reviewId).orElseThrow {
            IllegalArgumentException("Review not found with ID: $reviewId")
        }
    }

    fun getReviewsByExperience(experienceId: Long): List<Review> {
        val experience =
                experienceRepository.findById(experienceId).orElseThrow {
                    IllegalArgumentException("Experience not found with ID: $experienceId")
                }
        return reviewRepository.findByExperience(experience)
    }

    fun getReviewsByUser(userId: Long): List<Review> {
        val user =
                userRepository.findById(userId).orElseThrow {
                    IllegalArgumentException("User not found with ID: $userId")
                }
        return reviewRepository.findByUser(user)
    }

    @Transactional
    fun updateReview(reviewId: Long, rating: Int, description: String, userId: Long): Review {
        val review =
                reviewRepository.findById(reviewId).orElseThrow {
                    IllegalArgumentException("Review not found with ID: $reviewId")
                }

        // Ensure that only the review's author can update it
        if (review.user?.id != userId) {
            throw IllegalArgumentException("User is not authorized to update this review.")
        }

        // Validate rating
        if (rating !in 1..5) {
            throw IllegalArgumentException("Rating must be between 1 and 5.")
        }

        review.rating = rating
        review.description = description
        // Optionally, update the reviewDate or add a lastUpdatedDate field

        return reviewRepository.save(review)
    }

    @Transactional
    fun deleteReview(reviewId: Long, userId: Long) {
        val review =
                reviewRepository.findById(reviewId).orElseThrow {
                    IllegalArgumentException("Review not found with ID: $reviewId")
                }

        // Ensure that only the review's author or an admin can delete it
        if (review.user?.id != userId) {
            throw IllegalArgumentException("User is not authorized to delete this review.")
        }

        reviewRepository.delete(review)
    }
}
