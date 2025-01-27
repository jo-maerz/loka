package com.loka.server.entity

import com.fasterxml.jackson.annotation.JsonManagedReference
import jakarta.persistence.*

@Embeddable
data class Position(
    val lat: Double = 0.0,
    val lng: Double = 0.0
)

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

        fun fromDisplayName(displayName: String): Category {
            return map[displayName] ?: OTHERS
        }

        fun isValidCategory(displayName: String): Boolean {
            return map.containsKey(displayName)
        }
    }
}

@Entity
data class Experience(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long? = null,

    var name: String = "",
    var startDateTime: String = "",
    var endDateTime: String = "",
    var address: String = "",

    @Embedded
    var position: Position = Position(),

    var description: String = "",

    @ElementCollection
    @CollectionTable(name = "experience_hashtags", joinColumns = [JoinColumn(name = "experience_id")])
    var hashtags: List<String> = emptyList(),

    var category: String = "",

    @OneToMany(
        mappedBy = "experience",
        cascade = [CascadeType.ALL],
        orphanRemoval = true
    )
    @JsonManagedReference
    var images: MutableList<Image> = mutableListOf(),

    var createdAt: String = "",
    var updatedAt: String = "",
    var createdBy: String? = null
)