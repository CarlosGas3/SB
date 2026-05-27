package com.example.demo.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import com.example.demo.model.ContactRequest;
import com.example.demo.model.Purchase;
import com.example.demo.model.User;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    private JavaMailSender mailSender;

    public EmailService() {
        // Fallback constructor when no JavaMailSender bean is available.
    }

    @Autowired(required = false)
    public void setMailSender(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Async
    public void sendOrderConfirmation(User user, Purchase purchase) {
        String subject = "Confirmación de compra - ShadowBan";
        String body = buildBody(user, purchase);

        if (mailSender != null) {
            try {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setTo(user.getEmail());
                message.setBcc(new String[]{"crlsgscnls41@gmail.com", "chu4nig@gmail.com"});
                message.setSubject(subject);
                message.setText(body);
                mailSender.send(message);
                logger.info("Email real enviado a {} (BCC: crlsgscnls41@gmail.com, chu4nig@gmail.com)", user.getEmail());
                return;
            } catch (MailException e) {
                logger.warn("No se pudo enviar email real, usando fallback. Error: {}", e.getMessage());
            }
        }

        logger.info("[EMAIL MOCK] To: {}\nBCC: crlsgscnls41@gmail.com, chu4nig@gmail.com\nSubject: {}\n{}", user.getEmail(), subject, body);
    }

    @Async
    public void sendContactForm(ContactRequest request) {
        String subject = "Nueva propuesta de colaboración - ShadowBan";
        String body = buildContactBody(request);
        String[] recipients = {"crlsgscnls41@gmail.com", "chu4nig@gmail.com"};

        if (mailSender != null) {
            try {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setTo(recipients);
                message.setSubject(subject);
                message.setText(body);
                mailSender.send(message);
                logger.info("Email de contacto enviado a los administradores desde: {}", request.getEmail());
                return;
            } catch (MailException e) {
                logger.warn("No se pudo enviar email de contacto, usando fallback. Error: {}", e.getMessage());
            }
        }

        logger.info("[EMAIL MOCK] To: {}\nSubject: {}\n{}", String.join(", ", recipients), subject, body);
    }

    private String buildBody(User user, Purchase purchase) {
        StringBuilder builder = new StringBuilder();

        // Nombre y apellido (capitalizar primeras letras si es posible)
        String fullName = safe(user.getName()).trim();
        String first = "";
        String last = "";
        if (!fullName.isEmpty()) {
            String[] parts = fullName.split("\\s+");
            first = capitalize(parts[0]);
            if (parts.length > 1) {
                last = capitalize(parts[1]);
            }
        }

        builder.append("Hola");
        if (!first.isEmpty()) {
            builder.append(" ").append(first);
        }
        if (!last.isEmpty()) {
            builder.append(" ").append(last);
        }
        builder.append(",\n\n");

        builder.append("Gracias por tu compra, aquí tienes el resumen:\n\n");

        purchase.getItems().forEach(item -> builder.append("- ")
                .append(item.getProductName())
                .append(" x")
                .append(item.getQuantity())
                .append(" - ")
                .append(String.format("%.2f", item.getUnitPrice()))
                .append("€\n"));

        builder.append("\nTotal: ").append(String.format("%.2f", purchase.getTotal())).append("€\n\n");

        if (purchase.getShippingInfo() != null) {
            builder.append("Enviado a:\n")
                    .append(safe(purchase.getShippingInfo().getCity())).append(",\n")
                    .append(safe(purchase.getShippingInfo().getAddress())).append("\n\n");
        } else {
            builder.append("Enviado a:\n(sin información de envío)\n\n");
        }

        builder.append("Gracias por comprar con ShadowBan.");
        return builder.toString();
    }

    private String buildContactBody(ContactRequest request) {
        StringBuilder builder = new StringBuilder();

        builder.append("Nueva propuesta de colaboración recibida en ShadowBan\n");
        builder.append("=".repeat(60)).append("\n\n");

        builder.append("TIPO DE USUARIO: ").append(capitalize(safe(request.getUserType()))).append("\n\n");

        // Información de contacto
        builder.append("--- INFORMACIÓN DE CONTACTO ---\n");
        builder.append("Nombre: ").append(safe(request.getName())).append("\n");
        builder.append("Email: ").append(safe(request.getEmail())).append("\n");
        builder.append("Teléfono: ").append(safe(request.getPhone())).append("\n");
        builder.append("País/Región: ").append(safe(request.getCountry())).append("\n");
        if (request.getSocialMedia() != null && !request.getSocialMedia().isBlank()) {
            builder.append("Redes Sociales: ").append(safe(request.getSocialMedia())).append("\n");
        }
        builder.append("\n");

        // Información específica según tipo
        if ("artist".equals(request.getUserType())) {
            builder.append("--- INFORMACIÓN DEL ARTISTA ---\n");
            builder.append("Nombre Artístico: ").append(safe(request.getArtistName())).append("\n");
            builder.append("Género Musical: ").append(safe(request.getGenre())).append("\n");
            builder.append("Biografía: ").append(safe(request.getBio())).append("\n");
            if (request.getMusicLink() != null && !request.getMusicLink().isBlank()) {
                builder.append("Enlace a Música: ").append(safe(request.getMusicLink())).append("\n");
            }
            builder.append("Experiencia en Streaming: ").append(capitalize(safe(request.getExperience()))).append("\n");
        } else if ("brand".equals(request.getUserType())) {
            builder.append("--- INFORMACIÓN DE LA MARCA ---\n");
            builder.append("Nombre de la Empresa: ").append(safe(request.getCompanyName())).append("\n");
            builder.append("Sector/Industria: ").append(safe(request.getIndustry())).append("\n");
            builder.append("Descripción: ").append(safe(request.getBrandBio())).append("\n");
            builder.append("Público Objetivo: ").append(safe(request.getTargetAudience())).append("\n");
            builder.append("Presupuesto Estimado: ").append(safe(request.getBudget())).append("\n");
        }
        builder.append("\n");

        // Detalles de la colaboración
        builder.append("--- DETALLES DE LA COLABORACIÓN ---\n");
        if (request.getCollaborationType() != null && !request.getCollaborationType().isEmpty()) {
            builder.append("Tipo de Colaboración: ")
                    .append(String.join(", ", request.getCollaborationType()))
                    .append("\n");
        }
        builder.append("\nMensaje/Propuesta:\n");
        builder.append(safe(request.getMessage())).append("\n");
        builder.append("\n");

        // Preferencias
        builder.append("--- PREFERENCIAS ---\n");
        builder.append("Acepta Términos: ").append(request.isTerms() ? "Sí" : "No").append("\n");
        builder.append("Desea Notificaciones: ").append(request.isNotifications() ? "Sí" : "No").append("\n");

        return builder.toString();
    }

    private String capitalize(String s) {
        if (s == null || s.isBlank()) {
            return "";
        }
        s = s.trim();
        if (s.length() == 1) {
            return s.toUpperCase();
        }
        return s.substring(0, 1).toUpperCase() + s.substring(1).toLowerCase();
    }

    private String safe(String s) {
        return s == null ? "" : s;
    }
}
