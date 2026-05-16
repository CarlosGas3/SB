# SB Backend

Backend de ejemplo para el frontend en `SB/front`.

## Características

- Login básico con validación de contraseña
- Edición de datos de usuario
- Listado de productos desde JSON local
- Proceso de compra simulado
- Envío de email de confirmación mock

## Ejecutar

Desde `c:\Users\Samu\vsc-workspace\SB\backend`:

```powershell
mvn spring-boot:run
```

Si quieres activar un email real, configura variables de entorno o `application.yml`:

- `MAIL_HOST`
- `MAIL_PORT`
- `MAIL_USERNAME`
- `MAIL_PASSWORD`
- `MAIL_SMTP_AUTH=true`
- `MAIL_SMTP_STARTTLS=true`

## Endpoints

- `POST /api/auth/login`
  - Body: `{ "email": "...", "password": "..." }`
- `GET /api/users/{id}`
- `PUT /api/users/{id}`
- `GET /api/products`
- `GET /api/products/{id}`
- `POST /api/purchases`
  - Body: `{
      "userId": "...",
      "email": "...",
      "items": [{ "productId": "prod-1", "quantity": 2 }],
      "shippingInfo": { ... }
    }`
- `GET /api/purchases?userId=user-1`

## Datos locales

Los archivos JSON se guardan en `backend/data/`:

- `users.json`
- `products.json`
- `purchases.json`
