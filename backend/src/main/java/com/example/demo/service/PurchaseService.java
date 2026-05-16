package com.example.demo.service;

import com.example.demo.model.Purchase;
import com.example.demo.model.PurchaseItem;
import com.example.demo.model.PurchaseItemRequest;
import com.example.demo.model.PurchaseRequest;
import com.example.demo.model.Product;
import com.example.demo.model.User;
import com.example.demo.repository.JsonRepository;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class PurchaseService {
    private static final String PURCHASE_FILE = "purchases.json";
    private final JsonRepository jsonRepository;
    private final ProductService productService;
    private final UserService userService;
    private final EmailService emailService;

    public PurchaseService(JsonRepository jsonRepository, ProductService productService, UserService userService, EmailService emailService) {
        this.jsonRepository = jsonRepository;
        this.productService = productService;
        this.userService = userService;
        this.emailService = emailService;
    }

    public Purchase createPurchase(PurchaseRequest request) {
        try {
            List<Purchase> purchases = jsonRepository.readAll(PURCHASE_FILE, Purchase.class);
            List<PurchaseItem> items = buildItems(request.getItems());
            double total = items.stream().mapToDouble(item -> item.getUnitPrice() * item.getQuantity()).sum();

            Purchase purchase = new Purchase();
            purchase.setId(UUID.randomUUID().toString());
            purchase.setUserId(request.getUserId());
            purchase.setItems(items);
            purchase.setShippingInfo(request.getShippingInfo());
            purchase.setTotal(total);
            purchase.setCreatedAt(LocalDateTime.now());

            purchases.add(purchase);
            jsonRepository.writeAll(PURCHASE_FILE, purchases);

            User user = userService.getUserById(request.getUserId()).orElseGet(() -> {
                User fallback = new User();
                fallback.setEmail(request.getEmail());
                fallback.setName(request.getShippingInfo().getName());
                return fallback;
            });
            emailService.sendOrderConfirmation(user, purchase);
            return purchase;
        } catch (IOException e) {
            throw new RuntimeException("No se pudo procesar la compra", e);
        }
    }

    public List<Purchase> findPurchases(String userId) {
        try {
            List<Purchase> purchases = jsonRepository.readAll(PURCHASE_FILE, Purchase.class);
            if (userId == null || userId.isBlank()) {
                return purchases;
            }
            return purchases.stream().filter(purchase -> purchase.getUserId().equals(userId)).collect(Collectors.toList());
        } catch (IOException e) {
            throw new RuntimeException("No se pudo leer purchases.json", e);
        }
    }

    private List<PurchaseItem> buildItems(List<PurchaseItemRequest> itemRequests) {
        List<PurchaseItem> items = new ArrayList<>();
        if (itemRequests == null) {
            return items;
        }
        for (PurchaseItemRequest request : itemRequests) {
            Optional<Product> product = productService.getProductById(request.getProductId());
            if (product.isPresent()) {
                PurchaseItem item = new PurchaseItem();
                item.setProductId(product.get().getId());
                item.setProductName(product.get().getName());
                item.setQuantity(Math.max(1, request.getQuantity()));
                item.setUnitPrice(product.get().getPrice());
                items.add(item);
            }
        }
        return items;
    }
}
