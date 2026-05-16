package com.example.demo.service;

import java.io.IOException;
import java.io.InputStream;

import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

@Service
public class MockDataService {
    private final ObjectMapper mapper;

    public MockDataService() {
        this.mapper = new ObjectMapper();
        this.mapper.registerModule(new JavaTimeModule());
    }

    public JsonNode getVinsiProducts() {
        return readJsonResource("productsVinsi72.json");
    }

    public JsonNode getBoseProducts() {
        return readJsonResource("productsBose.json");
    }

    public JsonNode getSwyryProducts() {
        return readJsonResource("productsSwyry.json");
    }

    private JsonNode readJsonResource(String fileName) {
        try (InputStream resourceStream = getClass().getResourceAsStream("/data/" + fileName)) {
            if (resourceStream == null) {
                throw new IllegalStateException("Mock JSON resource not found: " + fileName);
            }
            return mapper.readTree(resourceStream);
        } catch (IOException e) {
            throw new RuntimeException("Error reading mock JSON resource: " + fileName, e);
        }
    }
}
