package com.example.demo.controller;

import com.example.demo.model.ApiResponse;
import com.example.demo.model.Product;
import com.example.demo.service.ProductService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {
    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Product>>> listProducts() {
        return ResponseEntity.ok(new ApiResponse<>(true, "Productos cargados", productService.getAllProducts()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Product>> getProduct(@PathVariable String id) {
        return productService.getProductById(id)
                .map(product -> ResponseEntity.ok(new ApiResponse<>(true, "Producto encontrado", product)))
                .orElseGet(() -> ResponseEntity.status(404).body(new ApiResponse<>(false, "Producto no encontrado", null)));
    }
}
