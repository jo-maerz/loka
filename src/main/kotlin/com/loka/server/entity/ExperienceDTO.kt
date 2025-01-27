package com.loka.server.entity

data class ExperienceDTO(
    val name: String,
    val startDateTime: String,
    val endDateTime: String,
    val address: String,
    val position: Position,
    val description: String?,
    val hashtags: List<String>?,
    val category: String
)