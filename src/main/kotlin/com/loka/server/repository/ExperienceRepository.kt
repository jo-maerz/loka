package com.example.loka.server.repository

import com.example.loka.server.entity.Experience
import org.springframework.data.jpa.repository.JpaRepository

interface ExperienceRepository : JpaRepository<Experience, Long>
