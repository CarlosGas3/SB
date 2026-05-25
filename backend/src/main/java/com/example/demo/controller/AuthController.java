package com.example.demo.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.model.ApiResponse;
import com.example.demo.model.LoginRequest;
import com.example.demo.model.User;
import com.example.demo.service.UserService;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<User>> login(@RequestBody LoginRequest request) {
        return userService.login(request)
                .map(user -> ResponseEntity.ok(new ApiResponse<>(true, "Login correcto", user)))
                .orElseGet(() -> ResponseEntity.status(401).body(new ApiResponse<>(false, "Email o contraseña incorrectos", null)));
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<User>> register(@RequestBody User user) {
        return userService.register(user)
                .map(created -> ResponseEntity.ok(new ApiResponse<>(true, "Usuario creado correctamente", created)))
                .orElseGet(() -> ResponseEntity.badRequest().body(new ApiResponse<>(false, "El email ya existe", null)));
    }
}
