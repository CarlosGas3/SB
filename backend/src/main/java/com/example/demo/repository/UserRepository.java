package com.example.demo.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import com.example.demo.model.User;

@Repository
public class UserRepository {

    private final JdbcTemplate jdbcTemplate;
    private final RowMapper<User> rowMapper = (rs, rowNum) -> {
        User user = new User();
        user.setId(rs.getString("id"));
        user.setEmail(rs.getString("email"));
        user.setName(rs.getString("name"));
        user.setPhone(rs.getString("phone"));
        user.setAddress(rs.getString("address"));
        user.setCity(rs.getString("city"));
        user.setCountry(rs.getString("country"));
        user.setTarjetaCredito(rs.getString("tarjeta_credito"));
        user.setPassword(rs.getString("password"));
        return user;
    };

    public UserRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public Optional<User> findByEmail(String email) {
        return jdbcTemplate.query("SELECT * FROM users WHERE email = ?", rowMapper, email).stream().findFirst();
    }

    public Optional<User> findById(String id) {
        return jdbcTemplate.query("SELECT * FROM users WHERE id = ?", rowMapper, id).stream().findFirst();
    }

    public boolean existsByEmail(String email) {
        Integer count = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM users WHERE email = ?", Integer.class, email);
        return count != null && count > 0;
    }

    public User save(User user) {
        if (user.getId() == null || user.getId().isBlank()) {
            user.setId(UUID.randomUUID().toString());
        }
        jdbcTemplate.update("INSERT INTO users (id, email, password, name, phone, address, city, country, tarjeta_credito) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                user.getId(),
                user.getEmail(),
                user.getPassword(),
                user.getName(),
                user.getPhone(),
                user.getAddress(),
                user.getCity(),
                user.getCountry(),
                user.getTarjetaCredito());
        return user;
    }

    public Optional<User> update(User update) {
        int rows = jdbcTemplate.update("UPDATE users SET name = ?, phone = ?, address = ?, city = ?, country = ? WHERE id = ?",
                update.getName(),
                update.getPhone(),
                update.getAddress(),
                update.getCity(),
                update.getCountry(),
                update.getId());
        return rows == 0 ? Optional.empty() : findById(update.getId());
    }

    public Optional<User> updatePassword(String id, String encodedPassword) {
        int rows = jdbcTemplate.update("UPDATE users SET password = ? WHERE id = ?", encodedPassword, id);
        return rows == 0 ? Optional.empty() : findById(id);
    }
}
