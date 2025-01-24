package com.loka.server.entity
import org.springframework.web.multipart.MultipartFile

data class ExperienceDTO(
    val name: String,
    val startDateTime: String,
    val endDateTime: String,
    val address: String,
    val position: Position,
    val description: String?,
    val hashtags: List<String>?,
    val category: String?
)