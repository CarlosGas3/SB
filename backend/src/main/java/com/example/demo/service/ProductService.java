package com.example.demo.service;

import com.example.demo.model.Product;
import com.example.demo.repository.JsonRepository;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

@Service
public class ProductService {
    private static final String PRODUCT_FILE = "products.json";
    private final JsonRepository jsonRepository;

    public ProductService(JsonRepository jsonRepository) {
        this.jsonRepository = jsonRepository;
    }

    public List<Product> getAllProducts() {
        try {
            return jsonRepository.readAll(PRODUCT_FILE, Product.class);
        } catch (IOException e) {
            throw new RuntimeException("No se pudo leer products.json", e);
        }
    }

    public Optional<Product> getProductById(String id) {
        return getAllProducts().stream().filter(product -> product.getId().equals(id)).findFirst();
    }
}
