package com.loka.server.entity
import jakarta.persistence.*

@Entity
class Image(

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long? = null,

    var name: String = "",

    var type: String = "",

    @Lob
    var imageData: ByteArray = byteArrayOf(),

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "experience_id")
    var experience: Experience? = null
)