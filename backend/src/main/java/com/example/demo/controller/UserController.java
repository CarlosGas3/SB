package com.example.demo.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.model.ApiResponse;
import com.example.demo.model.ChangePasswordRequest;
import com.example.demo.model.User;
import com.example.demo.service.UserService;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<User>> getUser(@PathVariable String id) {
        return userService.getUserById(id)
                .map(user -> ResponseEntity.ok(new ApiResponse<>(true, "Usuario encontrado", user)))
                .orElseGet(() -> ResponseEntity.status(404).body(new ApiResponse<>(false, "Usuario no encontrado", null)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<User>> updateUser(@PathVariable String id, @RequestBody User update) {
        return userService.updateUser(id, update)
                .map(user -> ResponseEntity.ok(new ApiResponse<>(true, "Usuario actualizado", user)))
                .orElseGet(() -> ResponseEntity.status(404).body(new ApiResponse<>(false, "Usuario no encontrado", null)));
    }

    @org.springframework.web.bind.annotation.PostMapping("/{id}/change-password")
    public ResponseEntity<ApiResponse<User>> changePassword(@PathVariable String id, @RequestBody ChangePasswordRequest req) {
        String current = req.getCurrentPassword();
        String newPass = req.getNewPassword();
        if (current == null || current.isBlank()) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, "Contraseña actual requerida", null));
        }

        // verification-only: if newPass not provided, just verify current password
        if (newPass == null || newPass.isBlank()) {
            boolean ok = userService.verifyPassword(id, current);
            if (ok) {
                return ResponseEntity.ok(new ApiResponse<>(true, "Contraseña correcta", null));
            }
            return ResponseEntity.status(400).body(new ApiResponse<>(false, "Contraseña incorrecta", null));
        }
        return userService.changePassword(id, current, newPass)
                .map(u -> ResponseEntity.ok(new ApiResponse<>(true, "Contraseña actualizada", u)))
                .orElseGet(() -> ResponseEntity.status(400).body(new ApiResponse<>(false, "Contraseña actual incorrecta", null)));
    }
}
