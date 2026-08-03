package com.rideloop.userservice.driver.storage;

import lombok.RequiredArgsConstructor;
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
@RequiredArgsConstructor
public class LocalStorageService implements StorageService {

    @Value("${storage.local.upload-path}")
    private String uploadPath;

    private final FileValidator validator;

    @Override
    public String store(MultipartFile file) {

        validator.validate(file);

        try {

            Path directory = Paths.get(uploadPath);

            Files.createDirectories(directory);

            String extension =
                    StringUtils.getFilenameExtension(
                            file.getOriginalFilename()
                    );

            String fileName =
                    UUID.randomUUID() + "." + extension;

            Path destination =
                    directory.resolve(fileName);

            Files.copy(
                    file.getInputStream(),
                    destination,
                    StandardCopyOption.REPLACE_EXISTING
            );

            return destination.toString();

        } catch (IOException ex) {

            throw new StorageException(
                    "Unable to store file.",
                    ex
            );
        }
    }
}