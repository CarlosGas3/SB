package com.example.demo.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.model.ApiResponse;
import com.example.demo.model.ContactRequest;
import com.example.demo.service.EmailService;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/contact")
public class ContactController {

    private final EmailService emailService;

    public ContactController(EmailService emailService) {
        this.emailService = emailService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<String>> submitContact(@RequestBody ContactRequest request) {
        if (request.getEmail() == null || request.getEmail().isBlank()) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, "El correo electrónico es obligatorio", null));
        }

        if (!request.isTerms()) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, "Debes aceptar los términos y condiciones", null));
        }

        emailService.sendContactForm(request);

        return ResponseEntity.ok(new ApiResponse<>(true,
                "Tu propuesta ha sido enviada correctamente. Nos pondremos en contacto pronto.", null));
    }
}
