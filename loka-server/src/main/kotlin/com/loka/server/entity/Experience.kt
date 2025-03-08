package com.loka.server.entity

import com.fasterxml.jackson.annotation.JsonFormat
import com.fasterxml.jackson.annotation.JsonManagedReference
import jakarta.persistence.*
import java.time.OffsetDateTime

@Embeddable data class Position(val lat: Double = 0.0, val lng: Double = 0.0)

enum class Category(val displayName: String) {
    FOOD_FESTIVAL("Food Festival"),
    ART_INSTALLATION("Art Installation"),
    CONCERT("Concert"),
    OUTDOOR_GATHERING("Outdoor Gathering"),
    FLEA_MARKET("Flea Market"),
    EXHIBITION("Exhibition"),
    WORKSHOP("Workshop"),
    NETWORKING_EVENT("Networking Event"),
    TECH_TALK("Tech Talk"),
    OTHERS("Others");

    companion object {
        private val map = values().associateBy(Category::displayName)
        fun fromDisplayName(displayName: String): Category = map[displayName] ?: OTHERS
        fun isValidCategory(displayName: String): Boolean = map.containsKey(displayName)
    }
}

@Entity
data class Experience(
        @Id @GeneratedValue(strategy = GenerationType.IDENTITY) var id: Long? = null,
        var name: String = "",
        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSSXXX")
        var startDateTime: OffsetDateTime? = null,
        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSSXXX")
        var endDateTime: OffsetDateTime? = null,
        var address: String = "",
        @Embedded var position: Position = Position(),
        var description: String = "",
        @ElementCollection
        @CollectionTable(
                name = "experience_hashtags",
                joinColumns = [JoinColumn(name = "experience_id")]
        )
        var hashtags: List<String> = emptyList(),
        var category: String = "",
        @OneToMany(mappedBy = "experience", cascade = [CascadeType.ALL], orphanRemoval = true)
        @JsonManagedReference
        var images: MutableList<Image> = mutableListOf(),
        @OneToMany(mappedBy = "experience", cascade = [CascadeType.ALL], orphanRemoval = true)
        @JsonManagedReference
        var reviews: MutableList<Review> = mutableListOf(),
        // For createdAt and updatedAt we keep them as strings in ISO format.
        var createdAt: String = "",
        var updatedAt: String = "",
        var createdBy: String? = null,
        var city: String = ""
)
