package com.rideloop.userservice.driver.storage;

import org.springframework.web.multipart.MultipartFile;

public interface StorageService {

    String store(
            MultipartFile file
    );

    String store(
            MultipartFile file,
            String subDirectory
    );

    String getSignedUrl(
            String storagePath
    );

    void delete(
            String storagePath
    );
}