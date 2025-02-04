package com.loka.server.entity

import jakarta.validation.constraints.Max
import jakarta.validation.constraints.Min
import jakarta.validation.constraints.NotBlank

data class ReviewDTO(
        @field:Min(1, message = "Stars must be at least 1")
        @field:Max(5, message = "Stars must be at most 5")
        val stars: Int,
        @field:NotBlank(message = "Description cannot be blank") val text: String
)

/** DTO that contains the reviewer’s basic information. */
data class ReviewerDTO(val firstName: String, val lastName: String, val email: String)

/** DTO that represents a review along with its reviewer's details. */
data class ReviewResponseDTO(
        val id: Long?,
        val stars: Int,
        val text: String,
        val userId: String,
        val createdAt: String,
        val updatedAt: String,
        val reviewer: ReviewerDTO
)

/** Maps a [Review] entity to a [ReviewResponseDTO]. */
fun toReviewResponseDTO(review: Review): ReviewResponseDTO {
        return ReviewResponseDTO(
                id = review.id,
                stars = review.stars,
                text = review.text,
                createdAt = review.createdAt,
                updatedAt = review.updatedAt,
                userId = review.user.keycloakId,
                reviewer =
                        ReviewerDTO(
                                firstName = review.user.firstName,
                                lastName = review.user.lastName,
                                email = review.user.email
                        )
        )
}
