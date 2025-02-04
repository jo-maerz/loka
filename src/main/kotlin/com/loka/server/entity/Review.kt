package com.loka.server.entity

import com.fasterxml.jackson.annotation.JsonBackReference
import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import jakarta.persistence.*
import java.time.Instant

@Entity
@Table(
        name = "reviews",
        uniqueConstraints = [UniqueConstraint(columnNames = ["user_id", "experience_id"])]
)
data class Review(
        @Id @GeneratedValue(strategy = GenerationType.IDENTITY) val id: Long? = null,
        @Column(nullable = false) var stars: Int = 1, // Default value
        @Column(name = "description", columnDefinition = "TEXT", nullable = false)
        var text: String = "",
        @ManyToOne(fetch = FetchType.LAZY)
        @JoinColumn(name = "user_id", nullable = false)
        @JsonIgnoreProperties("reviews")
        var user: User = User(),
        @ManyToOne(fetch = FetchType.LAZY)
        @JoinColumn(name = "experience_id", nullable = false)
        @JsonBackReference
        var experience: Experience = Experience(),
        @Column(nullable = false) var createdAt: String = Instant.now().toString(),
        @Column(nullable = false) var updatedAt: String = Instant.now().toString()
)
