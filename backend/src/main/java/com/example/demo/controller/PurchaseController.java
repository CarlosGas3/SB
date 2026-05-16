package com.example.demo.controller;

import com.example.demo.model.ApiResponse;
import com.example.demo.model.Purchase;
import com.example.demo.model.PurchaseRequest;
import com.example.demo.service.PurchaseService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/purchases")
public class PurchaseController {
    private final PurchaseService purchaseService;

    public PurchaseController(PurchaseService purchaseService) {
        this.purchaseService = purchaseService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Purchase>> createPurchase(@RequestBody PurchaseRequest request) {
        Purchase purchase = purchaseService.createPurchase(request);
        return ResponseEntity.ok(new ApiResponse<>(true, "Compra creada y email enviado (o logueado)", purchase));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Purchase>>> getPurchases(@RequestParam(required = false) String userId) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Compras recuperadas", purchaseService.findPurchases(userId)));
    }
}
