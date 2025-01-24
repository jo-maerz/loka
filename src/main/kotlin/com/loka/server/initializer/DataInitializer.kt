package com.loka.server.initializer
import org.springframework.boot.CommandLineRunner
import org.springframework.stereotype.Component
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter
import org.springframework.context.annotation.Profile
import com.loka.server.repository.ExperienceRepository
import kotlin.math.sin
import kotlin.math.cos
import kotlin.math.sqrt
import kotlin.random.Random
import com.loka.server.entity.*

@Component
@Profile("dev") 
class DataInitializer(private val experienceRepository: ExperienceRepository) : CommandLineRunner {

    override fun run(vararg args: String?) {
        experienceRepository.deleteAll()
        // Define city center coordinates and addresses
        val cities = listOf(
            "Frankfurt" to Pair(50.1109, 8.6821),
            "Hamburg" to Pair(53.5511, 9.9937),
            "Berlin" to Pair(52.5200, 13.4050),
            "München" to Pair(48.1351, 11.5820),
            "Köln" to Pair(50.9375, 6.9603)
        )

        val experiences = cities.flatMap { (city, position) ->
            (1..6).map {index ->
                createMockExperience(city, position, index)
            }
        }

        experienceRepository.saveAll(experiences)
    }

    private fun createMockExperience(city: String, position: Pair<Double, Double>, index: Int): Experience {
        val category = Category.values().random().displayName
        val formatter = DateTimeFormatter.ISO_DATE_TIME
        val startDate = LocalDateTime.of(2025, 1, 21, 10, 0) // Before January 22, 2025
        val endDate = LocalDateTime.of(2025, 3, 31, 18, 0) // Later than March 31, 2025

        val Distance = Random.nextDouble(0.0, 1.0) / 111.0 // Convert km to degrees
        val Angle = Random.nextDouble(0.0, 360.0) //  angle for circular area

        val deltaLat = Distance * cos(Math.toRadians(Angle))
        val deltaLng = Distance * sin(Math.toRadians(Angle)) / cos(Math.toRadians(position.first))

        return Experience(
            name = "Experience $index in $city",
            startDateTime = startDate.format(formatter),
            endDateTime = endDate.format(formatter),
            address = "City Center, $city",
            position = Position(
                lat = position.first + deltaLat,
                lng = position.second + deltaLng
                ),
            description = "Description for experience $index in $city",
            hashtags = listOf("#fun", "#$city", "#event"),
            category = category,
            images = mutableListOf(),
            createdAt = LocalDateTime.now().format(formatter),
            updatedAt = LocalDateTime.now().format(formatter)
        )
    }
}
