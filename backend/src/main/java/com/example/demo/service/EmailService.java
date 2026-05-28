package com.example.demo.service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

import org.json.JSONArray;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import com.example.demo.model.ContactRequest;
import com.example.demo.model.Purchase;
import com.example.demo.model.User;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    private final HttpClient httpClient = HttpClient.newHttpClient();

    private final String apiKey = System.getenv("BREVO_API_KEY");

    private final String senderEmail = "shadowbanoficialsite@gmail.com";
    private final String senderName = "ShadowBan";

    @Async
    public void sendOrderConfirmation(User user, Purchase purchase) {

        String subject = "Confirmación de compra - ShadowBan";
        String body = buildBody(user, purchase);

        boolean sent = sendEmail(user.getEmail(), subject, body, true);

        if (sent) {
            logger.info("Email enviado a {}", user.getEmail());
        } else {
            logger.warn("[EMAIL MOCK] To: {}\nSubject: {}\n{}", user.getEmail(), subject, body);
        }
    }

    @Async
    public void sendContactForm(ContactRequest request) {

        String subject = "Nueva propuesta de colaboración - ShadowBan";
        String body = buildContactBody(request);

        String admin1 = "crlsgscnls41@gmail.com";
        String admin2 = "chu4nig@gmail.com";

        sendEmail(admin1, subject, body, false);
        sendEmail(admin2, subject, body, false);

        logger.info("Email contacto enviado");
    }

    private boolean sendEmail(String to, String subject, String text, boolean withBcc) {

        if (apiKey == null || apiKey.isBlank()) {
            logger.warn("BREVO_API_KEY no configurada");
            return false;
        }

        try {
            JSONObject json = new JSONObject();

            JSONObject sender = new JSONObject();
            sender.put("name", senderName);
            sender.put("email", senderEmail);

            json.put("sender", sender);

            json.put("to", new JSONArray().put(
                    new JSONObject().put("email", to)
            ));

            if (withBcc) {
                JSONArray bcc = new JSONArray();
                bcc.put(new JSONObject().put("email", "crlsgscnls41@gmail.com"));
                bcc.put(new JSONObject().put("email", "chu4nig@gmail.com"));
                json.put("bcc", bcc);
            }

            json.put("subject", subject);
            json.put("textContent", text);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://api.brevo.com/v3/smtp/email"))
                    .header("api-key", apiKey)
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(json.toString()))
                    .build();

            HttpResponse<String> response
                    = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                return true;
            }

            logger.warn("Error Brevo: {}", response.body());
            return false;

        } catch (Exception e) {
            logger.warn("Error enviando email: {}", e.getMessage());
            return false;
        }
    }

    private String buildBody(User user, Purchase purchase) {

        StringBuilder builder = new StringBuilder();

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

        builder.append(",\n\nGracias por tu compra:\n\n");

        purchase.getItems().forEach(item
                -> builder.append("- ")
                        .append(item.getProductName())
                        .append(" x")
                        .append(item.getQuantity())
                        .append(" - ")
                        .append(String.format("%.2f", item.getUnitPrice()))
                        .append("€\n")
        );

        builder.append("\nTotal: ")
                .append(String.format("%.2f", purchase.getTotal()))
                .append("€\n");

        com.example.demo.model.ShippingInfo si = purchase.getShippingInfo();
        if (si != null) {
            String address = safe(si.getAddress());
            String city = safe(si.getCity());
            if (!address.isBlank() || !city.isBlank()) {
                builder.append("\nDirección de envío:\n");
                if (!address.isBlank()) {
                    builder.append("  Dirección: ").append(address).append("\n");
                }
                if (!city.isBlank()) {
                    builder.append("  Ciudad: ").append(city).append("\n");
                }
            }
        }

        return builder.toString();
    }

    private String buildContactBody(ContactRequest request) {
        return "Nuevo contacto:\n"
                + "Nombre: " + safe(request.getName()) + "\n"
                + "Email: " + safe(request.getEmail()) + "\n"
                + "Mensaje: " + safe(request.getMessage());
    }

    private String capitalize(String s) {
        if (s == null || s.isBlank()) {
            return "";
        }
        return s.substring(0, 1).toUpperCase() + s.substring(1).toLowerCase();
    }

    private String safe(String s) {
        return s == null ? "" : s;
    }
}
