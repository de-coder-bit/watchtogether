package com.watchtogether.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.S3ClientBuilder;
import software.amazon.awssdk.services.s3.S3Configuration;

import java.net.URI;

@Configuration
public class S3StorageConfig {

    @Value("${app.storage.provider:local}")
    private String storageProvider;

    @Value("${app.storage.s3.endpoint:http://localhost:9000}")
    private String endpoint;

    @Value("${app.storage.s3.region:us-east-1}")
    private String region;

    @Value("${app.storage.s3.access-key:minioadmin}")
    private String accessKey;

    @Value("${app.storage.s3.secret-key:minioadmin}")
    private String secretKey;

    @Value("${app.storage.s3.path-style-access:true}")
    private boolean pathStyleAccess;

    @Bean
    public S3Client s3Client() {
        if (!"s3".equalsIgnoreCase(storageProvider) && !"r2".equalsIgnoreCase(storageProvider) && !"minio".equalsIgnoreCase(storageProvider)) {
            // In local mode, return a dummy/null client or basic configuration
            return null;
        }

        AwsBasicCredentials credentials = AwsBasicCredentials.create(accessKey, secretKey);
        
        Region s3Region = "auto".equalsIgnoreCase(region) ? Region.US_EAST_1 : Region.of(region);

        S3ClientBuilder builder = S3Client.builder()
                .region(s3Region)
                .credentialsProvider(StaticCredentialsProvider.create(credentials))
                .serviceConfiguration(S3Configuration.builder()
                        .pathStyleAccessEnabled(pathStyleAccess)
                        .build());

        if (endpoint != null && !endpoint.isBlank()) {
            builder.endpointOverride(URI.create(endpoint));
        }

        return builder.build();
    }
}
