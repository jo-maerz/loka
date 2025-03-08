package com.loka.server.security

import com.loka.server.service.ReviewService
import org.springframework.security.core.Authentication
import org.springframework.stereotype.Component

@Component("reviewSecurity")
class ReviewSecurity(private val reviewService: ReviewService) {

    /**
     * Checks if the authenticated user is the owner of the experience with the given ID.
     *
     * @param id The ID of the review.
     * @param authentication The authentication object containing user details.
     * @return true if the user is the owner or has ADMIN role, false otherwise.
     */
    fun isOwner(id: Long, authentication: Authentication): Boolean {
        val review = reviewService.getReviewById(id) ?: return false
        val currentUsername = authentication.name
        val isAdmin = authentication.authorities.any { it.authority == "ADMIN" }
        return isAdmin || (review.createdBy == currentUsername)
    }
}
