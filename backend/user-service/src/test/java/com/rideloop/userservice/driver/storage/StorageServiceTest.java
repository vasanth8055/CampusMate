package com.rideloop.userservice.driver.storage;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.util.ReflectionTestUtils;

import java.io.File;
import java.nio.file.Path;

import static org.junit.jupiter.api.Assertions.*;

class StorageServiceTest {

    private FileValidator validator;
    private LocalStorageService localStorageService;
    private SupabaseStorageService supabaseStorageService;

    @TempDir
    Path tempDir;

    @BeforeEach
    void setUp() {
        validator = new FileValidator();
        localStorageService = new LocalStorageService(validator);
        ReflectionTestUtils.setField(localStorageService, "uploadPath", tempDir.toString());

        supabaseStorageService = new SupabaseStorageService(validator, new ObjectMapper());
        ReflectionTestUtils.setField(supabaseStorageService, "supabaseUrl", "https://mockproject.supabase.co");
        ReflectionTestUtils.setField(supabaseStorageService, "serviceRoleKey", "mock-service-role-key");
        ReflectionTestUtils.setField(supabaseStorageService, "bucket", "licenses");
        ReflectionTestUtils.setField(supabaseStorageService, "signedUrlTtl", 3600);
    }

    @Test
    void testFileValidator_ValidJpgAndPng() {
        MockMultipartFile jpgFile = new MockMultipartFile("file", "license.jpg", "image/jpeg", "fake-image".getBytes());
        MockMultipartFile pngFile = new MockMultipartFile("file", "license.png", "image/png", "fake-image".getBytes());

        assertDoesNotThrow(() -> validator.validate(jpgFile));
        assertDoesNotThrow(() -> validator.validate(pngFile));
    }

    @Test
    void testFileValidator_EmptyFileThrowsException() {
        MockMultipartFile emptyFile = new MockMultipartFile("file", "license.jpg", "image/jpeg", new byte[0]);
        StorageException ex = assertThrows(StorageException.class, () -> validator.validate(emptyFile));
        assertTrue(ex.getMessage().contains("cannot be empty"));
    }

    @Test
    void testFileValidator_InvalidMimeTypeThrowsException() {
        MockMultipartFile pdfFile = new MockMultipartFile("file", "license.pdf", "application/pdf", "fake-pdf".getBytes());
        StorageException ex = assertThrows(StorageException.class, () -> validator.validate(pdfFile));
        assertTrue(ex.getMessage().contains("Only JPG and PNG"));
    }

    @Test
    void testLocalStorageService_StoreAndGetSignedUrlAndDelete() {
        MockMultipartFile file = new MockMultipartFile("file", "my-license.png", "image/png", "image-content".getBytes());

        String path = localStorageService.store(file, "user-uuid-123");
        assertNotNull(path);
        assertTrue(path.contains("user-uuid-123"));
        assertTrue(path.endsWith(".png"));

        File storedFile = new File(path);
        assertTrue(storedFile.exists());

        String resolvedUrl = localStorageService.getSignedUrl(path);
        assertEquals(path.replace('\\', '/'), resolvedUrl);

        localStorageService.delete(path);
        assertFalse(storedFile.exists());
    }

    @Test
    void testSupabaseStorageService_MissingCredentialsThrowsException() {
        SupabaseStorageService unconfiguredService = new SupabaseStorageService(validator, new ObjectMapper());
        MockMultipartFile file = new MockMultipartFile("file", "license.jpg", "image/jpeg", "valid-content".getBytes());

        StorageException ex = assertThrows(StorageException.class, () -> unconfiguredService.store(file));
        assertTrue(ex.getMessage().contains("Supabase"));
    }

    @Test
    void testSupabaseStorageService_GetSignedUrlHandlesNullAndDirectUrls() {
        assertNull(supabaseStorageService.getSignedUrl(null));
        assertNull(supabaseStorageService.getSignedUrl(""));
        assertEquals("https://external.com/photo.jpg", supabaseStorageService.getSignedUrl("https://external.com/photo.jpg"));
        assertEquals("uploads/licenses/test.jpg", supabaseStorageService.getSignedUrl("uploads/licenses/test.jpg"));
    }
}
