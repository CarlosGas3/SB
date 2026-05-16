package com.example.demo.controller;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.service.MockDataService;
import com.fasterxml.jackson.databind.JsonNode;

@RestController
@RequestMapping("/api/mock/products")
@CrossOrigin(origins = "*")
public class MockDataController {
    private final MockDataService mockDataService;

    public MockDataController(MockDataService mockDataService) {
        this.mockDataService = mockDataService;
    }

    @GetMapping("/vinsi")
    public JsonNode getVinsiProducts() {
        return mockDataService.getVinsiProducts();
    }

    @GetMapping("/bose")
    public JsonNode getBoseProducts() {
        return mockDataService.getBoseProducts();
    }

    @GetMapping("/swyry")
    public JsonNode getSwyryProducts() {
        return mockDataService.getSwyryProducts();
    }
}
