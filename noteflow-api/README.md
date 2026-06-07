# Noteflow API

Backend de Noteflow construido con Next.js App Router y PostgreSQL.

Este proyecto expone una API REST para que la app móvil no se conecte directamente a la base de datos.

## Setup rápido

1. Entra en `noteflow-api`.
2. Instala dependencias:

```bash
npm install
```

3. Crea un archivo `.env.local` con estas variables:

```env
DATABASE_URL=
JWT_SECRET=
```

4. Asegúrate de que `.env.local` está en `.gitignore`.
5. Ejecuta el servidor:

```bash
npm run dev
```

6. La API corre en `http://localhost:3000/api`.

## Qué contiene

- `lib/db.ts`: conexión segura a Neon/PostgreSQL.
- `lib/auth.ts`: JWT, firma y validación de token.
- `sql/schema.sql`: esquema de la base de datos.
- `sql/queries.sql`: consulta relacional con JOIN para notas.
- `docs/backend-teoria.md`: teoría de cliente-servidor, REST y SQL.
- `docs/seguridad-api.md`: teoría de seguridad y variables de entorno.

## Endpoints

### Autenticación

- `POST /api/auth/register`
  - Body: `{ email, password }`
  - Response: `{ token, user: { id, email } }`

- `POST /api/auth/login`
  - Body: `{ email, password }`
  - Response: `{ token, user: { id, email } }`

### Salud

- `GET /api/health`
  - Response: `{ ok: true, message: 'OK' }` o error si falta `DATABASE_URL`.

### Notas

- `GET /api/notes`
  - Devuelve todas las notas del usuario autenticado.
  - Incluye `items` y `tags`.

- `POST /api/notes`
  - Crea una nota.
  - Body: `{ title, type, content?, color?, tags?, items? }`
  - Response: nota creada.

- `GET /api/notes/[id]`
  - Devuelve una nota específica.

- `PATCH /api/notes/[id]`
  - Actualiza una nota parcial.
  - Response: nota actualizada.

- `DELETE /api/notes/[id]`
  - Borra una nota.
  - Response: 204 No Content.

### Checklist items

- `GET /api/notes/[id]/checklist-items`
  - Lista los ítems de una nota.

- `POST /api/notes/[id]/checklist-items`
  - Body: `{ text }`
  - Crea un nuevo ítem.

- `PATCH /api/checklist-items/[itemId]`
  - Body: `{ isCompleted?, text? }`
  - Actualiza un ítem.

- `DELETE /api/checklist-items/[itemId]`
  - Elimina un ítem.

## Variables de entorno

- `DATABASE_URL`: cadena de conexión a PostgreSQL.
- `JWT_SECRET`: clave para firmar JWT.

## Notas importantes

- La app móvil debe enviar `Authorization: Bearer <token>` en las rutas protegidas.
- Las consultas usan parámetros para evitar inyección SQL.
- El backend no devuelve errores crudos de la base de datos al cliente.

## Documentación

- `docs/backend-teoria.md`
- `docs/seguridad-api.md`

## Archivos SQL

- `sql/schema.sql`: crea las tablas.
- `sql/queries.sql`: consulta con `LEFT JOIN` para notas, items y tags.
