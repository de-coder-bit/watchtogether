package com.watchtogether.service;

import jakarta.annotation.PostConstruct;
import org.apache.commons.io.FileUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;

import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;

@Service
public class StorageService {

    private static final Logger log = LoggerFactory.getLogger(StorageService.class);

    @Autowired(required = false)
    private S3Client s3Client;

    @Value("${app.storage.provider:local}")
    private String storageProvider;

    @Value("${app.storage.local-dir:./storage}")
    private String localDir;

    @Value("${app.storage.s3.bucket-name:watchtogether}")
    private String bucketName;

    @Value("${app.storage.s3.public-url:}")
    private String publicUrl;

    public StorageService() {}

    @PostConstruct
    public void init() {
        try {
            File dir = new File(localDir);
            if (!dir.exists()) {
                dir.mkdirs();
                log.info("Created local storage directory: {}", dir.getAbsolutePath());
            }

            if (isS3Enabled() && s3Client != null) {
                try {
                    s3Client.headBucket(HeadBucketRequest.builder().bucket(bucketName).build());
                    log.info("S3 Bucket '{}' is accessible", bucketName);
                } catch (NoSuchBucketException e) {
                    log.info("Creating S3 Bucket '{}'...", bucketName);
                    s3Client.createBucket(CreateBucketRequest.builder().bucket(bucketName).build());
                } catch (Exception e) {
                    log.warn("S3 bucket check failed (will continue): {}", e.getMessage());
                }
            }
        } catch (Exception e) {
            log.error("StorageService initialization error: {}", e.getMessage(), e);
        }
    }

    public boolean isS3Enabled() {
        return ("s3".equalsIgnoreCase(storageProvider) || "r2".equalsIgnoreCase(storageProvider) || "minio".equalsIgnoreCase(storageProvider))
                && s3Client != null;
    }

    public String uploadFile(String key, InputStream inputStream, long contentLength, String contentType) throws IOException {
        String normalizedKey = normalizeKey(key);

        if (isS3Enabled()) {
            PutObjectRequest request = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(normalizedKey)
                    .contentType(contentType != null ? contentType : getContentType(normalizedKey))
                    .build();

            s3Client.putObject(request, RequestBody.fromInputStream(inputStream, contentLength));
            return getFileUrl(normalizedKey);
        } else {
            Path targetPath = Paths.get(localDir, normalizedKey);
            Files.createDirectories(targetPath.getParent());
            Files.copy(inputStream, targetPath, StandardCopyOption.REPLACE_EXISTING);
            return getFileUrl(normalizedKey);
        }
    }

    public String uploadFile(String key, File file, String contentType) throws IOException {
        String normalizedKey = normalizeKey(key);

        if (isS3Enabled()) {
            PutObjectRequest request = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(normalizedKey)
                    .contentType(contentType != null ? contentType : getContentType(file.getName()))
                    .build();

            s3Client.putObject(request, RequestBody.fromFile(file));
            return getFileUrl(normalizedKey);
        } else {
            Path targetPath = Paths.get(localDir, normalizedKey);
            Files.createDirectories(targetPath.getParent());
            FileUtils.copyFile(file, targetPath.toFile());
            return getFileUrl(normalizedKey);
        }
    }

    public void uploadDirectory(String prefixKey, File directory) throws IOException {
        if (!directory.isDirectory()) {
            throw new IllegalArgumentException("Path is not a directory: " + directory.getAbsolutePath());
        }

        File[] files = directory.listFiles();
        if (files == null) return;

        for (File file : files) {
            if (file.isDirectory()) {
                uploadDirectory(prefixKey + "/" + file.getName(), file);
            } else {
                String fileKey = prefixKey + "/" + file.getName();
                uploadFile(fileKey, file, getContentType(file.getName()));
            }
        }
    }

    public File getLocalFile(String key) {
        String normalizedKey = normalizeKey(key);
        return Paths.get(localDir, normalizedKey).toFile();
    }

    public String getFileUrl(String key) {
        String normalizedKey = normalizeKey(key);

        if (isS3Enabled()) {
            if (publicUrl != null && !publicUrl.isBlank()) {
                String baseUrl = publicUrl.endsWith("/") ? publicUrl.substring(0, publicUrl.length() - 1) : publicUrl;
                return baseUrl + "/" + normalizedKey;
            }
            return "/api/storage/" + normalizedKey;
        } else {
            return "/storage/" + normalizedKey;
        }
    }

    public void deleteFile(String key) {
        String normalizedKey = normalizeKey(key);
        if (isS3Enabled()) {
            try {
                s3Client.deleteObject(DeleteObjectRequest.builder()
                        .bucket(bucketName)
                        .key(normalizedKey)
                        .build());
            } catch (Exception e) {
                log.warn("Failed to delete S3 file: {}", normalizedKey, e);
            }
        } else {
            File file = getLocalFile(normalizedKey);
            if (file.exists()) {
                file.delete();
            }
        }
    }

    public void deleteDirectory(String prefixKey) {
        String normalizedKey = normalizeKey(prefixKey);
        if (isS3Enabled()) {
            try {
                ListObjectsV2Response listResponse = s3Client.listObjectsV2(
                        ListObjectsV2Request.builder().bucket(bucketName).prefix(normalizedKey).build()
                );
                for (S3Object s3Object : listResponse.contents()) {
                    deleteFile(s3Object.key());
                }
            } catch (Exception e) {
                log.warn("Failed to delete S3 directory prefix: {}", normalizedKey, e);
            }
        } else {
            File dir = getLocalFile(normalizedKey);
            if (dir.exists() && dir.isDirectory()) {
                FileUtils.deleteQuietly(dir);
            }
        }
    }

    public String getContentType(String filename) {
        String lower = filename.toLowerCase();
        if (lower.endsWith(".m3u8")) return "application/vnd.apple.mpegurl";
        if (lower.endsWith(".ts")) return "video/MP2T";
        if (lower.endsWith(".mp4")) return "video/mp4";
        if (lower.endsWith(".mkv")) return "video/x-matroska";
        if (lower.endsWith(".webm")) return "video/webm";
        if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
        if (lower.endsWith(".png")) return "image/png";
        if (lower.endsWith(".webp")) return "image/webp";
        return "application/octet-stream";
    }

    private String normalizeKey(String key) {
        String normalized = key.replace("\\", "/");
        while (normalized.startsWith("/")) {
            normalized = normalized.substring(1);
        }
        return normalized;
    }
}
