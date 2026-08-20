package com.rideloop.userservice.driver.storage;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
@ConditionalOnProperty(name = "storage.type", havingValue = "local", matchIfMissing = true)
@RequiredArgsConstructor
@Slf4j
public class LocalStorageService implements StorageService {

    @Value("${storage.local.upload-path:uploads/licenses}")
    private String uploadPath;

    private final FileValidator validator;

    @Override
    public String store(MultipartFile file) {
        return store(file, null);
    }

    @Override
    public String store(MultipartFile file, String subDirectory) {
        validator.validate(file);

        try {
            Path directory = Paths.get(uploadPath);
            if (subDirectory != null && !subDirectory.isBlank()) {
                String safeSubDir = subDirectory.replaceAll("[^a-zA-Z0-9_-]", "");
                directory = directory.resolve(safeSubDir);
            }

            Files.createDirectories(directory);

            String extension = StringUtils.getFilenameExtension(file.getOriginalFilename());
            if (extension == null || extension.isBlank()) {
                extension = "png";
            }

            String fileName = UUID.randomUUID() + "." + extension.toLowerCase();
            Path destination = directory.resolve(fileName);

            Files.copy(
                    file.getInputStream(),
                    destination,
                    StandardCopyOption.REPLACE_EXISTING
            );

            return destination.toString().replace('\\', '/');

        } catch (IOException ex) {
            throw new StorageException("Unable to store file.", ex);
        }
    }

    @Override
    public String getSignedUrl(String storagePath) {
        if (storagePath == null || storagePath.isBlank()) {
            return null;
        }
        return storagePath.replace('\\', '/');
    }

    @Override
    public void delete(String storagePath) {
        if (storagePath == null || storagePath.isBlank()) {
            return;
        }

        try {
            Path path = Paths.get(storagePath);
            if (Files.exists(path)) {
                Files.delete(path);
                log.info("Deleted local storage file: {}", storagePath);
            }
        } catch (IOException ex) {
            log.warn("Failed to delete local storage file {}: {}", storagePath, ex.getMessage());
        }
    }
}