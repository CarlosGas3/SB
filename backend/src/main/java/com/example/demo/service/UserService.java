package com.example.demo.service;

import com.example.demo.model.LoginRequest;
import com.example.demo.model.User;
import com.example.demo.repository.JsonRepository;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

@Service
public class UserService {
    private static final String USER_FILE = "users.json";
    private final JsonRepository jsonRepository;

    public UserService(JsonRepository jsonRepository) {
        this.jsonRepository = jsonRepository;
    }

    public Optional<User> login(LoginRequest request) {
        try {
            List<User> users = jsonRepository.readAll(USER_FILE, User.class);
            return users.stream()
                    .filter(u -> u.getEmail().equalsIgnoreCase(request.getEmail()) && u.getPassword() != null)
                    .filter(u -> u.getPassword().equals(request.getPassword()))
                    .findFirst();
        } catch (IOException e) {
            throw new RuntimeException("No se pudo leer users.json", e);
        }
    }

    public Optional<User> getUserById(String id) {
        try {
            List<User> users = jsonRepository.readAll(USER_FILE, User.class);
            return users.stream().filter(user -> user.getId().equals(id)).findFirst();
        } catch (IOException e) {
            throw new RuntimeException("No se pudo leer users.json", e);
        }
    }

    public Optional<User> updateUser(String id, User update) {
        try {
            List<User> users = jsonRepository.readAll(USER_FILE, User.class);
            for (int i = 0; i < users.size(); i++) {
                User existing = users.get(i);
                if (existing.getId().equals(id)) {
                    existing.setName(update.getName() != null ? update.getName() : existing.getName());
                    existing.setPhone(update.getPhone() != null ? update.getPhone() : existing.getPhone());
                    existing.setAddress(update.getAddress() != null ? update.getAddress() : existing.getAddress());
                    existing.setCity(update.getCity() != null ? update.getCity() : existing.getCity());
                    existing.setCountry(update.getCountry() != null ? update.getCountry() : existing.getCountry());
                    users.set(i, existing);
                    jsonRepository.writeAll(USER_FILE, users);
                    return Optional.of(existing);
                }
            }
            return Optional.empty();
        } catch (IOException e) {
            throw new RuntimeException("No se pudo actualizar users.json", e);
        }
    }
}
