package com.loka.server.initializer

import com.loka.server.entity.*
import com.loka.server.repository.ExperienceRepository
import java.time.Instant
import java.time.OffsetDateTime
import java.time.ZoneOffset
import java.time.format.DateTimeFormatter
import kotlin.math.cos
import kotlin.math.sin
import kotlin.random.Random
import org.springframework.boot.CommandLineRunner
import org.springframework.context.annotation.Profile
import org.springframework.stereotype.Component

@Component
@Profile("dev")
class DataInitializer(private val experienceRepository: ExperienceRepository) : CommandLineRunner {

        override fun run(vararg args: String?) {
                experienceRepository.deleteAll()
                if (experienceRepository.findAll().isEmpty()) {
                        val cities =
                                listOf(
                                        "Frankfurt" to Pair(50.1109, 8.6821),
                                        "Hamburg" to Pair(53.5511, 9.9937),
                                        "Berlin" to Pair(52.5200, 13.4050),
                                        "München" to Pair(48.1351, 11.5820),
                                        "Köln" to Pair(50.9375, 6.9603)
                                )

                        val experiences =
                                cities.flatMap { (city, position) ->
                                        (1..6).map { index ->
                                                createMockExperience(city, position, index)
                                        }
                                }

                        experienceRepository.saveAll(experiences)
                }
        }

        private fun createMockExperience(
                city: String,
                position: Pair<Double, Double>,
                index: Int
        ): Experience {
                val category = Category.values().random().displayName
                val formatter = DateTimeFormatter.ISO_OFFSET_DATE_TIME
                val offset = ZoneOffset.ofHours(1)

                // Current time with fixed offset
                val now = OffsetDateTime.now(offset)

                // Random start date: between now-2 months and now+2 months
                val earliestStartEpoch = now.minusMonths(2).toEpochSecond()
                val latestStartEpoch = now.plusMonths(2).toEpochSecond()
                val randomStartEpoch = Random.nextLong(earliestStartEpoch, latestStartEpoch)

                // Convert epoch second to Instant, then to OffsetDateTime
                val startInstant = Instant.ofEpochSecond(randomStartEpoch)
                val randomStart = OffsetDateTime.ofInstant(startInstant, offset)

                // Random duration from 1 day to 4 weeks (1..28 days)
                val randomDays = Random.nextLong(1, 29)
                val randomEnd = randomStart.plusDays(randomDays)

                // Random position shift
                val distance = Random.nextDouble(0.0, 1.0) / 111.0
                val angle = Random.nextDouble(0.0, 360.0)
                val deltaLat = distance * cos(Math.toRadians(angle))
                val deltaLng =
                        distance * sin(Math.toRadians(angle)) / cos(Math.toRadians(position.first))

                return Experience(
                        name = "Experience $index in $city",
                        startDateTime = randomStart,
                        endDateTime = randomEnd,
                        address = "City Center, $city",
                        position =
                                Position(
                                        lat = position.first + deltaLat,
                                        lng = position.second + deltaLng
                                ),
                        description = "Description for experience $index in $city",
                        hashtags = listOf("#fun", "#$city", "#event"),
                        category = category,
                        images = mutableListOf(),
                        createdAt = OffsetDateTime.now(offset).format(formatter),
                        updatedAt = OffsetDateTime.now(offset).format(formatter)
                )
        }
}
