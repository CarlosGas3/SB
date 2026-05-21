package com.example.demo.repository;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import com.example.demo.model.Purchase;
import com.example.demo.model.PurchaseItem;

@Repository
public class PurchaseRepository {
    private final JdbcTemplate jdbcTemplate;

    public PurchaseRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public void savePurchase(Purchase purchase) {
        for (PurchaseItem item : purchase.getItems()) {
            jdbcTemplate.update(
                    "INSERT INTO purchases (order_id, user_id, product_id, product_name, size, quantity, unit_price, total_price, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                    purchase.getId(),
                    purchase.getUserId(),
                    item.getProductId(),
                    item.getProductName(),
                    item.getSize(),
                    item.getQuantity(),
                    item.getUnitPrice(),
                    item.getTotalPrice(),
                    "completed"
            );
        }
    }

    public List<Purchase> findPurchases(String userId) {
        StringBuilder sql = new StringBuilder("SELECT order_id, user_id, product_id, product_name, size, quantity, unit_price, total_price, created_at FROM purchases");
        List<Map<String, Object>> rows;
        if (userId != null && !userId.isBlank()) {
            sql.append(" WHERE user_id = ? ORDER BY created_at DESC");
            rows = jdbcTemplate.queryForList(sql.toString(), userId);
        } else {
            sql.append(" ORDER BY created_at DESC");
            rows = jdbcTemplate.queryForList(sql.toString());
        }

        Map<String, Purchase> purchases = new LinkedHashMap<>();
        for (Map<String, Object> row : rows) {
            String orderId = (String) row.get("order_id");
            Purchase purchase = purchases.computeIfAbsent(orderId, id -> {
                Purchase p = new Purchase();
                p.setId(id);
                p.setUserId((String) row.get("user_id"));
                p.setCreatedAt(((Timestamp) row.get("created_at")).toLocalDateTime());
                p.setItems(new ArrayList<>());
                p.setTotal(0);
                return p;
            });

            PurchaseItem item = new PurchaseItem();
            item.setProductId((String) row.get("product_id"));
            item.setProductName((String) row.get("product_name"));
            item.setSize((String) row.get("size"));
            item.setQuantity(((Number) row.get("quantity")).intValue());
            item.setUnitPrice(((Number) row.get("unit_price")).doubleValue());
            item.setTotalPrice(((Number) row.get("total_price")).doubleValue());
            purchase.getItems().add(item);
            purchase.setTotal(purchase.getTotal() + item.getTotalPrice());
        }

        return new ArrayList<>(purchases.values());
    }
}
