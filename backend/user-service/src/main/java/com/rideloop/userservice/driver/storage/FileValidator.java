package com.rideloop.userservice.driver.storage;

import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

@Component
public class FileValidator {

    public void validate(MultipartFile file) {

        if (file == null || file.isEmpty()) {
            throw new StorageException("File cannot be empty.");
        }

        String contentType = file.getContentType();

        if (contentType == null ||
                !(contentType.equals("image/jpeg")
                        || contentType.equals("image/png")
                        || contentType.equals("image/jpg"))) {

            throw new StorageException(
                    "Only JPG and PNG images are allowed."
            );
        }
    }
}