# ShadowBan

Plataforma web de música independiente. Permite descubrir artistas, explorar y comprar merchandise, y gestionar una cuenta de usuario.

## Estructura

```
SB/
├── front/      # Frontend estático (HTML, CSS, JS)
└── backend/    # API REST (Spring Boot + MySQL)
```

## Front

Páginas HTML puras con estilos propios y un único archivo `scripts.js`. No requiere build.

Abre cualquier archivo de `front/html/` directamente en el navegador, o sirve la carpeta con cualquier servidor estático.

## Backend

API REST en Spring Boot 3.3 con Java 21 y MySQL. Gestiona usuarios, productos, compras y envío de emails.

Ver [`backend/README.md`](backend/README.md) para instrucciones detalladas de configuración y endpoints.

## Despliegue

El proyecto está hosteado en **Railway**: `https://shadowban.up.railway.app`
