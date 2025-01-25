package com.loka.server.entity

import jakarta.persistence.*

@Entity
data class Image(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,

    val fileName: String = "",

    @Lob
    @Column(columnDefinition = "bytea")
    val data: ByteArray = ByteArray(0),

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "experience_id")
    val experience: Experience? = null
)
