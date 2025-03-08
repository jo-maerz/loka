package com.loka.server.config

import com.amazonaws.ClientConfiguration
import com.amazonaws.auth.AWSStaticCredentialsProvider
import com.amazonaws.auth.BasicAWSCredentials
import com.amazonaws.client.builder.AwsClientBuilder
import com.amazonaws.services.s3.AmazonS3
import com.amazonaws.services.s3.AmazonS3ClientBuilder
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

@Configuration
class MinioConfig {

    @Bean
    fun amazonS3(): AmazonS3 {
        // In production, read from environment variables or config
        val accessKey = "minioadmin"
        val secretKey = "minioadmin"
        val endpointUrl = "http://localhost:9000"
        val region = "us-east-1" // or anything

        val creds = BasicAWSCredentials(accessKey, secretKey)
        val clientConfig = ClientConfiguration()

        return AmazonS3ClientBuilder.standard()
                .withEndpointConfiguration(
                        AwsClientBuilder.EndpointConfiguration(endpointUrl, region)
                )
                .withPathStyleAccessEnabled(true) // needed for MinIO
                .withClientConfiguration(clientConfig)
                .withCredentials(AWSStaticCredentialsProvider(creds))
                .build()
    }
}
