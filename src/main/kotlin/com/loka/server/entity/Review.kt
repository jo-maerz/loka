package com.loka.server.entity

import com.fasterxml.jackson.annotation.JsonBackReference
import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(
        name = "reviews",
        uniqueConstraints = [UniqueConstraint(columnNames = ["user_id", "experience_id"])]
)
data class Review(
        @Id @GeneratedValue(strategy = GenerationType.IDENTITY) var id: Long? = null,
        @ManyToOne(fetch = FetchType.LAZY, optional = false)
        @JoinColumn(name = "user_id", nullable = false)
        @JsonBackReference
        var user: User? = null,
        @ManyToOne(fetch = FetchType.LAZY, optional = false)
        @JoinColumn(name = "experience_id", nullable = false)
        @JsonBackReference
        var experience: Experience? = null,
        @Column(name = "review_date", nullable = false)
        var reviewDate: LocalDateTime = LocalDateTime.now(),
        @Column(name = "rating", nullable = false) var rating: Int = 1,
        @Column(name = "description", nullable = false, length = 1000) var description: String = ""
)
