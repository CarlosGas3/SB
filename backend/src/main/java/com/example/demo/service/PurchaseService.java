package com.example.demo.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.example.demo.model.Product;
import com.example.demo.model.Purchase;
import com.example.demo.model.PurchaseItem;
import com.example.demo.model.PurchaseItemRequest;
import com.example.demo.model.PurchaseRequest;
import com.example.demo.model.User;
import com.example.demo.repository.PurchaseRepository;

@Service
public class PurchaseService {
    private final PurchaseRepository purchaseRepository;
    private final ProductService productService;
    private final UserService userService;
    private final EmailService emailService;

    public PurchaseService(PurchaseRepository purchaseRepository, ProductService productService, UserService userService, EmailService emailService) {
        this.purchaseRepository = purchaseRepository;
        this.productService = productService;
        this.userService = userService;
        this.emailService = emailService;
    }

    public Purchase createPurchase(PurchaseRequest request) {
        List<PurchaseItem> items = buildItems(request.getItems());
        double total = items.stream().mapToDouble(PurchaseItem::getTotalPrice).sum();

        if (items.isEmpty()) {
            throw new IllegalArgumentException("La compra debe contener al menos un producto");
        }

        String userId = request.getUserId();
        if ((userId == null || userId.isBlank()) && request.getEmail() != null) {
            userId = userService.findByEmail(request.getEmail()).map(User::getId).orElse(null);
        }

        if (userId == null || userId.isBlank()) {
            if (request.getEmail() != null && !request.getEmail().isBlank()) {
                User guest = userService.createGuest(request.getEmail(), request.getShippingInfo() != null ? request.getShippingInfo().getName() : "Cliente");
                userId = guest.getId();
            } else {
                throw new IllegalArgumentException("El usuario debe identificarse con userId o email");
            }
        }

        Purchase purchase = new Purchase();
        purchase.setId(UUID.randomUUID().toString());
        purchase.setUserId(userId);
        purchase.setItems(items);
        purchase.setShippingInfo(request.getShippingInfo());
        purchase.setTotal(total);
        purchase.setCreatedAt(LocalDateTime.now());

        purchaseRepository.savePurchase(purchase);

        User user = userService.getUserById(userId).orElseGet(() -> {
            User fallback = new User();
            fallback.setEmail(request.getEmail());
            fallback.setName(request.getShippingInfo() != null ? request.getShippingInfo().getName() : "Cliente");
            return fallback;
        });
        emailService.sendOrderConfirmation(user, purchase);
        return purchase;
    }

    public List<Purchase> findPurchases(String userId) {
        return purchaseRepository.findPurchases(userId);
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
                item.setSize(request.getSize());
                item.setQuantity(Math.max(1, request.getQuantity()));
                item.setUnitPrice(product.get().getPrice());
                item.setTotalPrice(item.getUnitPrice() * item.getQuantity());
                items.add(item);
            }
        }
        return items;
    }
}
