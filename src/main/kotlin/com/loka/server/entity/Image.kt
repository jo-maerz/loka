package com.loka.server.entity

import com.fasterxml.jackson.annotation.JsonBackReference
import jakarta.persistence.*

@Entity
data class Image(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,

    // Full or relative path to the file on disk
    @Column(name = "file_path", nullable = false)
    val filePath: String = "",

    @Column(name = "file_name", nullable = false)
    val fileName: String = "",

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "experience_id")
    @JsonBackReference
    val experience: Experience? = null
)