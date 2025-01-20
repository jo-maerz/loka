package com.loka.server.entity
import jakarta.persistence.*

@Embeddable
data class Position(
    val lat: Double = 0.0,
    val lng: Double = 0.0
)

@Entity
data class Experience(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,

    val name: String = "",

    val startDateTime: String = "", // ISO string with date and time

    val endDateTime: String = "",   // ISO string with date and time

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

    val updatedAt: String = ""
)
