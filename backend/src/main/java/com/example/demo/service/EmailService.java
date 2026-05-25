package com.example.demo.service;

import com.example.demo.model.Purchase;
import com.example.demo.model.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

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
        String subject = "Confirmación de compra " + purchase.getId();
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
        builder.append("Hola ").append(user.getName()).append(",\n\n");
        builder.append("Gracias por tu compra. Aquí tienes el resumen:\n\n");
        purchase.getItems().forEach(item -> builder.append("- ")
                .append(item.getProductName())
                .append(" x")
                .append(item.getQuantity())
                .append(" — €")
                .append(item.getUnitPrice())
                .append("\n"));
        builder.append("\nTotal: €").append(purchase.getTotal()).append("\n\n");
        builder.append("Enviado a:\n")
                .append(purchase.getShippingInfo().getName()).append("\n")
                .append(purchase.getShippingInfo().getAddress()).append("\n")
                .append(purchase.getShippingInfo().getCity()).append(", ")
                .append(purchase.getShippingInfo().getPostalCode()).append("\n")
                .append(purchase.getShippingInfo().getCountry()).append("\n\n");
        builder.append("Gracias por comprar con nosotros.\n");
        return builder.toString();
    }
}
