Backend 

Cliente - Servidor

En este proyecto la app móvil es el cliente y `noteflow-api` es el servidor. El cliente nunca habla directamente con la base de datos.

¿Por qué? porque si el `connection string` de PostgreSQL quedara en la app móvil, alguien podría descompilarla y obtener acceso directo a la base de datos.

La API actúa como guardián:
- valida que los datos que llegan sean correctos,
- valida que el usuario tenga permiso,
- y solo entonces hace la operación en la base de datos.

¿Qué es una API REST?

REST es una forma de estructurar una API donde los recursos se manejan con rutas y métodos HTTP.

En este backend usamos:
- `GET` para leer datos,
- `POST` para crear datos,
- `PATCH` para modificar datos parcialmente,
- `DELETE` para eliminar datos.

Cada ruta representa un recurso: notas, checklist items, auth.

Códigos de estado importantes

Los códigos HTTP nos dicen si la petición fue exitosa o no.

- `200 OK`: todo bien.
- `201 Created`: se creó un recurso.
- `204 No Content`: se borró algo y no hay cuerpo.
- `400 Bad Request`: el cliente envió algo inválido.
- `401 Unauthorized`: falta token o no es válido.
- `404 Not Found`: no existe el recurso solicitado.
- `500 Internal Server Error`: algo falló en el servidor.

Base de datos relacional

Una base de datos relacional organiza los datos en tablas. Cada tabla tiene filas y columnas.

En este proyecto tenemos estas tablas principales:

- `users`
- `notes`
- `checklist_items`
- `note_tags`

Cada tabla representa una entidad distinta.

ACID

Las bases de datos relacionales como PostgreSQL nos dan propiedades ACID.

- Atomicidad: una operación se hace completa o no se hace.
- Consistencia: la base de datos siempre cumple sus reglas.
- Aislamiento: varias transacciones no se mezclan entre sí.
- Durabilidad: una vez confirmado, el cambio no se pierde.

Por ejemplo, si creamos una nota con checklist items, queremos que o se cree todo o no se cree nada.

Primary Key y UUID

La `primary key` es el identificador único de cada fila.

En esta app usamos `UUID` en lugar de números autoincrementales porque permite crear IDs desde el cliente antes de hablar con el servidor.

Esto es útil para apps móviles offline o para tener IDs únicos sin depender de la base de datos.

Foreign Key y ON DELETE CASCADE

Una `foreign key` es un campo que referencia otra tabla.

En `checklist_items` y `note_tags` usamos:
- `note_id UUID NOT NULL REFERENCES notes(id) ON DELETE CASCADE`

Eso significa que si borro una nota, sus items y tags se borran automáticamente.

DDL vs DML

- DDL (Data Definition Language) define la estructura:
  - `CREATE`, `ALTER`, `DROP`
- DML (Data Manipulation Language) manipula datos:
  - `SELECT`, `INSERT`, `UPDATE`, `DELETE`

En `sql/schema.sql` está el DDL del proyecto.

Diseño del esquema

El esquema principal es:

Tabla `users`
- `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- `email VARCHAR(255) NOT NULL UNIQUE`
- `password_hash TEXT NOT NULL`
- `created_at TIMESTAMPTZ DEFAULT NOW()`
- `updated_at TIMESTAMPTZ DEFAULT NOW()`

Tabla `notes`
- `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- `user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE`
- `title VARCHAR(255) NOT NULL`
- `content TEXT`
- `type VARCHAR(50) NOT NULL CHECK (type IN ('note', 'checklist', 'idea'))`
- `color VARCHAR(7)`
- `created_at TIMESTAMPTZ DEFAULT NOW()`
- `updated_at TIMESTAMPTZ DEFAULT NOW()`

Tabla `checklist_items`
- `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- `note_id UUID NOT NULL REFERENCES notes(id) ON DELETE CASCADE`
- `text VARCHAR(255) NOT NULL`
- `is_completed BOOLEAN DEFAULT FALSE`

Tabla `note_tags`
- `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- `note_id UUID NOT NULL REFERENCES notes(id) ON DELETE CASCADE`
- `tag VARCHAR(100) NOT NULL`

Diagrama entidad-relación (ER)

- `users` 1 --- N `notes`
- `notes` 1 --- N `checklist_items`
- `notes` 1 --- N `note_tags`

Esto quiere decir:
- un usuario puede tener muchas notas,
- una nota puede tener muchos checklist items,
- y una nota puede tener muchas etiquetas.

JOINs en SQL

Para devolver notas junto con sus items y tags usamos `LEFT JOIN`.

`INNER JOIN`
Devuelve solo filas que tienen coincidencia en ambas tablas.

Se usa cuando ambas entidades deben existir juntas.

`LEFT JOIN`
Devuelve todas las filas de la tabla izquierda, incluso si no hay coincidencia en la derecha.

En este caso, una nota puede no tener items o tags, así que `LEFT JOIN` es la mejor opción.

Consulta de ejemplo

```sql
SELECT
  n.id,
  n.title,
  n.type,
  n.content,
  n.color,
  n.created_at AS "createdAt",
  n.updated_at AS "updatedAt",
  COALESCE(
    json_agg(DISTINCT jsonb_build_object(
      'id', ci.id,
      'text', ci.text,
      'isCompleted', ci.is_completed
    )) FILTER (WHERE ci.id IS NOT NULL),
    '[]'
  ) AS items,
  COALESCE(
    json_agg(DISTINCT nt.tag) FILTER (WHERE nt.tag IS NOT NULL),
    '[]'
  ) AS tags
FROM notes n
LEFT JOIN checklist_items ci ON n.id = ci.note_id
LEFT JOIN note_tags nt ON n.id = nt.note_id
GROUP BY n.id
ORDER BY n.created_at DESC;
```

- `COALESCE(..., '[]')` asegura que si no hay items o tags, la API devuelve `[]`.
- `json_agg` agrupa los resultados relacionados en un arreglo JSON.

Resumen

El backend es la capa que protege la base de datos y mantiene la lógica de negocio.

Estas son las responsabilidades que cumple:
- validar datos con `zod`,
- evitar inyección SQL con consultas parametrizadas,
- manejar autenticación con JWT,
- mantener el esquema relacional con `UUID` y `ON DELETE CASCADE`.
