package com.rideloop.userservice.driver.storage;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.UUID;

@Service
@ConditionalOnProperty(name = "storage.type", havingValue = "supabase")
@RequiredArgsConstructor
@Slf4j
public class SupabaseStorageService implements StorageService {

    @Value("${storage.supabase.url:}")
    private String supabaseUrl;

    @Value("${storage.supabase.service-role-key:}")
    private String serviceRoleKey;

    @Value("${storage.supabase.bucket:licenses}")
    private String bucket;

    @Value("${storage.supabase.signed-url-ttl-seconds:3600}")
    private int signedUrlTtl;

    private final FileValidator validator;
    private final ObjectMapper objectMapper;

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    private String cleanBaseUrl() {
        if (supabaseUrl == null || supabaseUrl.isBlank()) {
            throw new StorageException("Supabase URL is not configured.");
        }
        String url = supabaseUrl.trim();
        while (url.endsWith("/")) {
            url = url.substring(0, url.length() - 1);
        }
        return url;
    }

    private void validateCredentials() {
        if (serviceRoleKey == null || serviceRoleKey.isBlank()) {
            throw new StorageException("Supabase service-role key is not configured.");
        }
    }

    @Override
    public String store(MultipartFile file) {
        return store(file, null);
    }

    @Override
    public String store(MultipartFile file, String subDirectory) {
        validator.validate(file);
        validateCredentials();

        try {
            String baseUrl = cleanBaseUrl();
            String extension = StringUtils.getFilenameExtension(file.getOriginalFilename());
            if (extension == null || extension.isBlank()) {
                extension = "png";
            }

            String fileName = UUID.randomUUID() + "." + extension.toLowerCase();
            String objectPath = (subDirectory != null && !subDirectory.isBlank())
                    ? subDirectory.replaceAll("[^a-zA-Z0-9_-]", "") + "/" + fileName
                    : fileName;

            String uploadUrl = String.format("%s/storage/v1/object/%s/%s", baseUrl, bucket, objectPath);
            String contentType = file.getContentType() != null ? file.getContentType() : "application/octet-stream";

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(uploadUrl))
                    .timeout(Duration.ofSeconds(30))
                    .header("apikey", serviceRoleKey)
                    .header("Content-Type", contentType)
                    .header("x-upsert", "true")
                    .POST(HttpRequest.BodyPublishers.ofByteArray(file.getBytes()))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                log.info("Successfully uploaded object to Supabase storage: bucket={}, path={}", bucket, objectPath);
                return objectPath;
            } else {
                log.error("Supabase Storage upload failed with status code: {}", response.statusCode());
                throw new StorageException("Failed to upload file to storage. Server returned status: " + response.statusCode());
            }

        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new StorageException("Storage upload request interrupted.", e);
        } catch (IOException e) {
            throw new StorageException("Failed to read file or communicate with storage service.", e);
        }
    }

    @Override
    public String getSignedUrl(String storagePath) {
        if (storagePath == null || storagePath.isBlank()) {
            return null;
        }

        // If it's already an absolute URL or local path, return as is
        if (storagePath.startsWith("http://") || storagePath.startsWith("https://") || storagePath.startsWith("uploads/")) {
            return storagePath;
        }

        validateCredentials();

        try {
            String baseUrl = cleanBaseUrl();
            String signUrl = String.format("%s/storage/v1/object/sign/%s/%s", baseUrl, bucket, storagePath);
            String requestBody = String.format("{\"expiresIn\":%d}", signedUrlTtl);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(signUrl))
                    .timeout(Duration.ofSeconds(10))
                    .header("apikey", serviceRoleKey)
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                JsonNode jsonNode = objectMapper.readTree(response.body());
                String signedUrl = jsonNode.has("signedURL")
                        ? jsonNode.get("signedURL").asText()
                        : (jsonNode.has("signedUrl") ? jsonNode.get("signedUrl").asText() : null);

                if (signedUrl != null && !signedUrl.isBlank()) {
                    if (signedUrl.startsWith("http://") || signedUrl.startsWith("https://")) {
                        return signedUrl;
                    }
                    if (!signedUrl.startsWith("/storage/v1")) {
                        signedUrl = "/storage/v1" + signedUrl;
                    }
                    return baseUrl + signedUrl;
                }
            }

            log.warn("Failed to generate signed URL for path: {}, status: {}", storagePath, response.statusCode());
            return null;

        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            log.warn("Signed URL request interrupted for path: {}", storagePath);
            return null;
        } catch (Exception e) {
            log.warn("Error generating signed URL for path {}: {}", storagePath, e.getMessage());
            return null;
        }
    }

    @Override
    public void delete(String storagePath) {
        if (storagePath == null || storagePath.isBlank()) {
            return;
        }

        if (storagePath.startsWith("http://") || storagePath.startsWith("https://") || storagePath.startsWith("uploads/")) {
            return;
        }

        validateCredentials();

        try {
            String baseUrl = cleanBaseUrl();
            String deleteUrl = String.format("%s/storage/v1/object/%s/%s", baseUrl, bucket, storagePath);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(deleteUrl))
                    .timeout(Duration.ofSeconds(10))
                    .header("apikey", serviceRoleKey)
                    .DELETE()
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                log.info("Successfully deleted object from Supabase storage: bucket={}, path={}", bucket, storagePath);
            } else {
                log.warn("Supabase Storage delete returned status code: {} for path: {}", response.statusCode(), storagePath);
            }

        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            log.warn("Delete request interrupted for path: {}", storagePath);
        } catch (Exception e) {
            log.warn("Failed to delete storage file {}: {}", storagePath, e.getMessage());
        }
    }
}
