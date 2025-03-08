package com.loka.server.repository

import com.loka.server.entity.User
import java.util.Optional
import org.springframework.data.jpa.repository.JpaRepository

interface UserRepository : JpaRepository<User, Long> {
    fun findByKeycloakId(keycloakId: String): Optional<User>
    fun findByEmail(email: String): Optional<User>
}
