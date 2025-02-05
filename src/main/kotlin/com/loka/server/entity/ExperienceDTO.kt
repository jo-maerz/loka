package com.loka.server.entity

import com.fasterxml.jackson.annotation.JsonFormat
import java.time.OffsetDateTime

data class ExperienceDTO(
        val name: String,
        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSSXXX")
        val startDateTime: OffsetDateTime,
        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSSXXX")
        val endDateTime: OffsetDateTime,
        val address: String,
        val position: Position,
        val description: String?,
        val hashtags: List<String>?,
        val category: String
)
