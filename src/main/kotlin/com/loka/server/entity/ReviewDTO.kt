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
