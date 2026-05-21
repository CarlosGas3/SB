package com.example.demo;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;

public class DbCheck {
    public static void main(String[] args) {
        String url = "jdbc:mysql://localhost:3306/shadow_ban?useSSL=false&serverTimezone=UTC";
        String user = "root";
        String pass = "1234";
           try {
              Class.forName("com.mysql.cj.jdbc.Driver");
              try (Connection c = DriverManager.getConnection(url, user, pass);
                  Statement s = c.createStatement()) {
            System.out.println("Connected to DB: " + url);

            ResultSet rs = s.executeQuery("SELECT table_name FROM information_schema.tables WHERE table_schema='shadow_ban';");
            System.out.println("Tables in shadow_ban:");
            while (rs.next()) {
                System.out.println(" - " + rs.getString(1));
            }

            try (ResultSet r1 = s.executeQuery("SELECT COUNT(*) FROM users")) {
                if (r1.next()) System.out.println("users count: " + r1.getInt(1));
            } catch (Exception e) {
                System.out.println("users table not present or error: " + e.getMessage());
            }

            try (ResultSet r2 = s.executeQuery("SELECT COUNT(*) FROM products")) {
                if (r2.next()) System.out.println("products count: " + r2.getInt(1));
            } catch (Exception e) {
                System.out.println("products table not present or error: " + e.getMessage());
            }

            }
        } catch (Exception ex) {
            System.out.println("DB connection/query failed: " + ex.getMessage());
            ex.printStackTrace();
            System.exit(1);
        }
    }
}
