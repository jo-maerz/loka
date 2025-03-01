package com.loka.server.repository

import com.loka.server.entity.Experience
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param

interface ExperienceRepository : JpaRepository<Experience, Long> {

        @Query(
                value =
                        """
                        SELECT e.*
                        FROM experience e
                        WHERE (:city IS NULL OR e.city = :city)
                        AND (
                            (:startDate IS NULL AND :endDate IS NULL) 
                            OR (:startDate IS NOT NULL AND e.end_date_time <= CAST(:endDate AS timestamptz) AND e.end_date_time >= CAST(:startDate AS timestamptz))
                            OR (:endDate IS NOT NULL AND e.start_date_time <= CAST(:endDate AS timestamptz)  AND e.start_date_time >= CAST(:startDate AS timestamptz))
                        )
                        AND (:category  IS NULL OR e.category = :category)
                        """,
                nativeQuery = true
        )
        fun findByFilters(
                @Param("city") city: String?,
                @Param("startDate") startDate: String?,
                @Param("endDate") endDate: String?,
                @Param("category") category: String?
        ): List<Experience>
}
