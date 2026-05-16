package com.example.demo.repository;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.type.CollectionType;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

@Component
public class JsonRepository {
    private final Path dataDir;
    private final ObjectMapper mapper;

    public JsonRepository(@Value("${app.data-dir:data}") String dataDir) {
        this.dataDir = Path.of(dataDir).toAbsolutePath();
        this.mapper = new ObjectMapper();
        this.mapper.registerModule(new JavaTimeModule());
    }

    @PostConstruct
    public void init() throws IOException {
        if (Files.notExists(dataDir)) {
            Files.createDirectories(dataDir);
        }
    }

    public <T> List<T> readAll(String fileName, Class<T> clazz) throws IOException {
        Path file = resolveFile(fileName);
        ensureFileExists(fileName, file);
        CollectionType type = mapper.getTypeFactory().constructCollectionType(List.class, clazz);
        return mapper.readValue(file.toFile(), type);
    }

    public <T> void writeAll(String fileName, List<T> items) throws IOException {
        Path file = resolveFile(fileName);
        Files.createDirectories(file.getParent());
        mapper.writerWithDefaultPrettyPrinter().writeValue(file.toFile(), items);
    }

    private Path resolveFile(String fileName) {
        return dataDir.resolve(fileName);
    }

    private void ensureFileExists(String fileName, Path file) throws IOException {
        if (Files.notExists(file)) {
            InputStream resourceStream = getClass().getResourceAsStream("/data/" + fileName);
            if (resourceStream != null) {
                Files.copy(resourceStream, file);
            } else {
                Files.writeString(file, "[]");
            }
        }
    }
}
