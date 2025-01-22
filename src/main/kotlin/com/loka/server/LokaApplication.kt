package com.loka.server

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

@SpringBootApplication
class LokaApplication

fun main(args: Array<String>) {
    runApplication<LokaApplication>(*args)
}
