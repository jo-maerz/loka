package com.loka.server.entity
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
    val id: Long? = null,

    val name: String = "",
    val startDateTime: String = "", // ISO string with date and time

    val endDateTime: String = "", // ISO string with date and time
    val address: String = "",
    
    @Embedded
    val position: Position = Position(),

    val description: String = "",
    
    @ElementCollection
    @CollectionTable(name = "experience_hashtags", joinColumns = [JoinColumn(name = "experience_id")])
    @Column(name = "hashtag")
    val hashtags: List<String> = emptyList(),

    val category: String = "",
    
    @ElementCollection
    @CollectionTable(name = "experience_pictures", joinColumns = [JoinColumn(name = "experience_id")])
    @Column(name = "picture")
    val pictures: List<String> = emptyList(),

    val createdAt: String = "",
    val updatedAt: String = "",
    
    @Column(name = "created_by")
    val createdBy: String? = null
)