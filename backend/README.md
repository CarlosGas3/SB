# SB Backend

Backend de la aplicación ShadowBan. Desarrollado con **Spring Boot 3.3** y **Java 21**, usa **MySQL** como base de datos y **Brevo** para el envío de emails transaccionales. El frontend (`SB/front`) se copia automáticamente a `src/main/resources/static` durante el build, por lo que el mismo JAR sirve tanto la API como el frontend estático.

## Tecnologías

| Tecnología | Uso |
|---|---|
| Spring Boot 3.3 | Framework principal |
| Java 21 | Lenguaje |
| MySQL | Base de datos |
| Spring JDBC | Acceso a datos |
| Brevo (SMTP API) | Envío de emails |
| Jackson | Serialización JSON |

## Requisitos

- Java 21+
- Maven 3.9+
- MySQL (local o remoto)

## Variables de entorno

| Variable | Descripción |
|---|---|
| `MYSQLHOST` | Host del servidor MySQL |
| `MYSQLPORT` | Puerto MySQL (normalmente `3306`) |
| `MYSQLDATABASE` | Nombre de la base de datos |
| `MYSQLUSER` | Usuario MySQL |
| `MYSQLPASSWORD` | Contraseña MySQL |
| `BREVO_API_KEY` | API key de Brevo para envío de emails |
| `BREVO_SMTP_USER` | Usuario SMTP de Brevo |
| `PORT` | Puerto del servidor (por defecto `8080`) |

## Ejecutar en local

```powershell
cd SB/backend
mvn spring-boot:run
```

El frontend estará disponible en `http://localhost:8080` y la API en `http://localhost:8080/api`.

## Endpoints

### Autenticación — `/api/auth`

| Método | Ruta | Descripción |
|---|---|---|
| `POST` | `/api/auth/login` | Iniciar sesión |
| `POST` | `/api/auth/register` | Crear cuenta nueva |

**Login** — body:
```json
{ "email": "usuario@ejemplo.com", "password": "contraseña" }
```

**Registro** — body:
```json
{
  "name": "Nombre Apellido",
  "email": "usuario@ejemplo.com",
  "password": "contraseña",
  "phone": "600000000",
  "address": "Calle Ejemplo 1",
  "city": "Madrid",
  "country": "España"
}
```

---

### Usuarios — `/api/users`

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/users/{id}` | Obtener datos de un usuario |
| `PUT` | `/api/users/{id}` | Actualizar datos de un usuario |

---

### Productos — `/api/products`

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/products` | Listar todos los productos |
| `GET` | `/api/products/{id}` | Obtener un producto por ID |

---

### Productos mock (catálogos externos) — `/api/mock/products`

Sirven los JSON locales de `src/main/resources/data/`.

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/mock/products/bose` | Catálogo Bose |
| `GET` | `/api/mock/products/swyry` | Catálogo Swyry |
| `GET` | `/api/mock/products/vinsi` | Catálogo Vinsi72 |

---

### Compras — `/api/purchases`

| Método | Ruta | Descripción |
|---|---|---|
| `POST` | `/api/purchases` | Crear una compra y enviar email de confirmación |
| `GET` | `/api/purchases?userId={id}` | Listar compras de un usuario |

**Crear compra** — body:
```json
{
  "userId": "uuid-opcional",
  "email": "usuario@ejemplo.com",
  "items": [
    { "productId": "prod-1", "quantity": 1, "size": "M", "unitPrice": 29.99, "name": "Nombre producto" }
  ],
  "shippingInfo": {
    "name": "Nombre Apellido",
    "address": "Calle Ejemplo 1",
    "city": "Madrid",
    "postalCode": "28001",
    "country": "España",
    "phone": "600000000"
  }
}
```

> Si el usuario está loggeado (`userId` válido), `shippingInfo` puede omitirse; el backend la rellena con los datos del perfil guardado.

---

### Contacto — `/api/contact`

| Método | Ruta | Descripción |
|---|---|---|
| `POST` | `/api/contact` | Enviar propuesta de colaboración |

El formulario envía un email a los administradores con los datos del artista o marca.

---

## Estructura del proyecto

```
backend/
├── src/main/java/com/example/demo/
│   ├── controller/       # Endpoints REST
│   ├── service/          # Lógica de negocio y email
│   ├── model/            # Entidades y DTOs
│   └── repository/       # Acceso a base de datos
├── src/main/resources/
│   ├── application.yml   # Configuración
│   ├── schema.sql        # DDL de la base de datos
│   └── data/             # JSONs de catálogos mock
└── pom.xml
```

## Base de datos

El esquema se aplica automáticamente al arrancar desde `schema.sql`. Las tablas principales son `users`, `products` y `purchases`.

## Email de confirmación de compra

Al completar una compra se envía un email al comprador con:
- Saludo personalizado con nombre
- Detalle de artículos y cantidades
- Total de la compra
- Dirección y ciudad de envío (si están disponibles)
