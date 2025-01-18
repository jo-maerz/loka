package com.example.loka.server.entity
import jakarta.persistence.*

@Entity
data class Experience(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,
    val name: String,
    val location: String,
    val date: String
)
