package com.loka.server.entity

import jakarta.persistence.*
import com.fasterxml.jackson.annotation.JsonBackReference
import com.fasterxml.jackson.annotation.JsonIgnore

@Entity
data class Image(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,

    @Lob
    @Column(name = "data", nullable = false)
    @JsonIgnore // Prevents Jackson from serializing this field
    val data: ByteArray = ByteArray(0),

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "experience_id")
    @JsonBackReference // Manages bidirectional relationship serialization
    val experience: Experience? = null,

    @Column(name = "file_name", nullable = false)
    val fileName: String = ""
)
