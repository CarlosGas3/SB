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

        String email = request.getEmail() != null ? request.getEmail().trim() : "";
        if (email.isBlank()) {
            throw new IllegalArgumentException("El correo electrónico es obligatorio para completar la compra");
        }

        String userId = request.getUserId();
        User user = null;
        if (userId != null && !userId.isBlank()) {
            user = userService.getUserById(userId).orElse(null);
        }
        if (user == null) {
            user = userService.findByEmail(email).orElse(null);
            if (user != null) {
                userId = user.getId();
            }
        }

        Purchase purchase = new Purchase();
        purchase.setId(UUID.randomUUID().toString());
        purchase.setUserId(userId);
        purchase.setItems(items);
        // If shipping info not provided but we have a user, use user's saved address
        if ((request.getShippingInfo() == null || request.getShippingInfo().getAddress() == null || request.getShippingInfo().getAddress().isBlank()) && user != null) {
            com.example.demo.model.ShippingInfo si = new com.example.demo.model.ShippingInfo();
            si.setName(user.getName());
            si.setAddress(user.getAddress());
            si.setCity(user.getCity());
            si.setCountry(user.getCountry());
            si.setPostalCode("");
            si.setPhone(user.getPhone());
            purchase.setShippingInfo(si);
        } else {
            purchase.setShippingInfo(request.getShippingInfo());
        }
        purchase.setTotal(total);
        purchase.setCreatedAt(LocalDateTime.now());

        purchaseRepository.savePurchase(purchase);

        User emailUser = user;
        if (emailUser == null) {
            emailUser = new User();
            emailUser.setEmail(email);
            emailUser.setName(request.getShippingInfo() != null ? request.getShippingInfo().getName() : "Cliente");
        }
        emailService.sendOrderConfirmation(emailUser, purchase);
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
            PurchaseItem item = new PurchaseItem();
            item.setProductId(request.getProductId());
            item.setSize(request.getSize());
            item.setQuantity(Math.max(1, request.getQuantity()));

            if (product.isPresent()) {
                item.setProductName(product.get().getName());
                item.setUnitPrice(product.get().getPrice());
            } else {
                Double unitPrice = request.getUnitPrice();
                if (unitPrice == null) {
                    unitPrice = 0.0;
                }
                item.setProductName(request.getName() != null && !request.getName().isBlank() ? request.getName() : request.getProductId());
                item.setUnitPrice(unitPrice);
            }

            item.setTotalPrice(item.getUnitPrice() * item.getQuantity());
            items.add(item);
        }
        return items;
    }
}
