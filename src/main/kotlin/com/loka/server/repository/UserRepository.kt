package com.loka.server.repository

import com.loka.server.entity.User
import org.springframework.data.jpa.repository.JpaRepository
import java.util.Optional

interface UserRepository : JpaRepository<User, Long> {
    fun findByKeycloakId(keycloakId: String): Optional<User>
    fun findByEmail(email: String): Optional<User>
}
