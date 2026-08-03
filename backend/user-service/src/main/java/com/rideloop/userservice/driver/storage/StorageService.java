package com.rideloop.userservice.driver.storage;

import org.springframework.web.multipart.MultipartFile;

public interface StorageService {

    String store(
            MultipartFile file
    );

}