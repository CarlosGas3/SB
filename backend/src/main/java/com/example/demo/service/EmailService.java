package com.example.demo.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

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

    public void sendOrderConfirmation(User user, Purchase purchase) {
        String subject = "Confirmación de compra - ShadowBan";
        String body = buildBody(user, purchase);

        if (mailSender != null) {
            try {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setTo(user.getEmail());
                message.setSubject(subject);
                message.setText(body);
                mailSender.send(message);
                logger.info("Email real enviado a {}", user.getEmail());
                return;
            } catch (MailException e) {
                logger.warn("No se pudo enviar email real, usando fallback. Error: {}", e.getMessage());
            }
        }

        logger.info("[EMAIL MOCK] To: {}\nSubject: {}\n{}", user.getEmail(), subject, body);
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
