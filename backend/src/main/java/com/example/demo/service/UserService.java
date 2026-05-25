package com.example.demo.service;

import java.util.Optional;

import org.springframework.stereotype.Service;

import com.example.demo.model.LoginRequest;
import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public Optional<User> login(LoginRequest request) {
        return userRepository.findByEmail(request.getEmail())
                .filter(user -> {
                    String storedPassword = user.getPassword();
                    if (storedPassword == null) {
                        return false;
                    }
                    return passwordEncoder.matches(request.getPassword(), storedPassword)
                            || storedPassword.equals(request.getPassword());
                });
    }

    public Optional<User> getUserById(String id) {
        return userRepository.findById(id);
    }

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public Optional<User> register(User user) {
        if (user.getEmail() == null || user.getEmail().isBlank()) {
            throw new IllegalArgumentException("El email es obligatorio");
        }
        if (userRepository.existsByEmail(user.getEmail())) {
            return Optional.empty();
        }
        if (user.getPassword() != null) {
            user.setPassword(passwordEncoder.encode(user.getPassword()));
        }
        return Optional.of(userRepository.save(user));
    }

    public User createGuest(String email, String name) {
        User guest = new User();
        guest.setEmail(email);
        guest.setName(name);
        guest.setPassword("");
        return userRepository.save(guest);
    }

    public Optional<User> updateUser(String id, User update) {
        return userRepository.findById(id).flatMap(existing -> {
            existing.setName(update.getName() != null ? update.getName() : existing.getName());
            existing.setPhone(update.getPhone() != null ? update.getPhone() : existing.getPhone());
            existing.setAddress(update.getAddress() != null ? update.getAddress() : existing.getAddress());
            existing.setCity(update.getCity() != null ? update.getCity() : existing.getCity());
            existing.setCountry(update.getCountry() != null ? update.getCountry() : existing.getCountry());
            return userRepository.update(existing);
        });
    }
}
