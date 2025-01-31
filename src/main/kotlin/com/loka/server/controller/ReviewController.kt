package com.loka.server.controller

import com.loka.server.entity.Review
import com.loka.server.service.ReviewService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/reviews")
class ReviewController(private val reviewService: ReviewService) {
    // Create a new review
    @PostMapping
    fun createReview(
            @RequestParam userId: Long,
            @RequestParam experienceId: Long,
            @RequestParam rating: Int,
            @RequestParam description: String
    ): ResponseEntity<Review> {
        return try {
            val review = reviewService.createReview(userId, experienceId, rating, description)
            ResponseEntity.ok(review)
        } catch (ex: IllegalArgumentException) {
            ResponseEntity.badRequest().body(null)
        }
    }

    // Get a review by ID
    @GetMapping("/{id}")
    fun getReviewById(@PathVariable id: Long): ResponseEntity<Review> {
        return try {
            val review = reviewService.getReviewById(id)
            ResponseEntity.ok(review)
        } catch (ex: IllegalArgumentException) {
            ResponseEntity.notFound().build()
        }
    }

    // Get all reviews for a specific experience
    @GetMapping("/experience/{experienceId}")
    fun getReviewsByExperience(@PathVariable experienceId: Long): ResponseEntity<List<Review>> {
        return try {
            val reviews = reviewService.getReviewsByExperience(experienceId)
            ResponseEntity.ok(reviews)
        } catch (ex: IllegalArgumentException) {
            ResponseEntity.notFound().build()
        }
    }

    // Get all reviews by a specific user
    @GetMapping("/user/{userId}")
    fun getReviewsByUser(@PathVariable userId: Long): ResponseEntity<List<Review>> {
        return try {
            val reviews = reviewService.getReviewsByUser(userId)
            ResponseEntity.ok(reviews)
        } catch (ex: IllegalArgumentException) {
            ResponseEntity.notFound().build()
        }
    }

    // Update a review
    @PutMapping("/{id}")
    fun updateReview(
            @PathVariable id: Long,
            @RequestParam rating: Int,
            @RequestParam description: String,
            @RequestParam userId: Long
    ): ResponseEntity<Review> {
        return try {
            val updatedReview = reviewService.updateReview(id, rating, description, userId)
            ResponseEntity.ok(updatedReview)
        } catch (ex: IllegalArgumentException) {
            ResponseEntity.badRequest().body(null)
        }
    }

    // Delete a review
    @DeleteMapping("/{id}")
    fun deleteReview(@PathVariable id: Long, @RequestParam userId: Long): ResponseEntity<Void> {
        return try {
            reviewService.deleteReview(id, userId)
            ResponseEntity.noContent().build()
        } catch (ex: IllegalArgumentException) {
            ResponseEntity.badRequest().build()
        }
    }
}
