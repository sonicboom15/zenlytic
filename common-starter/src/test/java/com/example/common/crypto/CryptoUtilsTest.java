package com.example.common.crypto;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class CryptoUtilsTest {

    @Test
    @DisplayName("Should encrypt and decrypt text successfully")
    void testEncryptAndDecrypt() {
        String originalText = "Sensitive PII Customer SSN: 123-45-6789";
        String cipherText = CryptoUtils.encrypt(originalText);

        assertNotNull(cipherText);
        assertNotEquals(originalText, cipherText);

        String decryptedText = CryptoUtils.decrypt(cipherText);
        assertEquals(originalText, decryptedText);
    }

    @Test
    @DisplayName("Should handle null strings safely")
    void testNullSafety() {
        assertNull(CryptoUtils.encrypt(null));
        assertNull(CryptoUtils.decrypt(null));
    }

    @Test
    @DisplayName("EncryptedStringConverter should convert to and from database column")
    void testConverter() {
        EncryptedStringConverter converter = new EncryptedStringConverter();
        String plain = "SecretToken12345";

        String dbColumn = converter.convertToDatabaseColumn(plain);
        assertNotNull(dbColumn);
        assertNotEquals(plain, dbColumn);

        String entityAttr = converter.convertToEntityAttribute(dbColumn);
        assertEquals(plain, entityAttr);
    }
}
