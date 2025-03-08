package com.loka.server.entity

import com.fasterxml.jackson.annotation.JsonManagedReference
import jakarta.persistence.*

@Entity
@Table(name = "users")
data class User(
        @Id @GeneratedValue(strategy = GenerationType.IDENTITY) val id: Long = 0,
        @Column(name = "keycloak_id", nullable = false, unique = true) var keycloakId: String = "",
        @Column(name = "email", nullable = false, unique = true) var email: String = "",
        @Column(name = "first_name", nullable = false) var firstName: String = "",
        @Column(name = "last_name", nullable = false) var lastName: String = "",
        @OneToMany(mappedBy = "user", cascade = [CascadeType.ALL], orphanRemoval = true)
        @JsonManagedReference
        var reviews: MutableList<Review> = mutableListOf()
)
