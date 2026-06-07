Seguridad API

¿Qué es SQL injection?

SQL injection es cuando un atacante mete código dentro de una entrada que el servidor usa directamente en una consulta SQL.

Por ejemplo, si tienes algo así:

```js
const title = req.body.title;
const query = "SELECT * FROM notes WHERE title = '" + title + "'";
```

Y el atacante envía:

```sql
' OR 1=1; --
```

La consulta puede quedar como:

```sql
SELECT * FROM notes WHERE title = '' OR 1=1; --'
```

Eso significa que el atacante puede leer o borrar datos que no debería.

¿Cómo lo prevenimos?

Usando consultas parametrizadas.

En lugar de mezclar código SQL con valores, separamos la consulta de los datos:

```js
await query('SELECT * FROM notes WHERE title = $1', [req.body.title]);
```

Aquí `title` se trata como dato, nunca como parte del código SQL.

En el backend de Noteflow todas las consultas usan `$1`, `$2`, etc. y pasan los valores por separado.

 · Variables de entorno

Las variables de entorno son una forma de guardar información sensible fuera del código fuente.

En este proyecto usamos:

- `DATABASE_URL`
- `JWT_SECRET`

El `DATABASE_URL` es la cadena de conexión a PostgreSQL. Nunca debe estar en el código ni en el repositorio.

Por eso usamos:

- `.env.local` para valores privados en el entorno local,
- `.env.example` como plantilla sin valores reales.

Si el `connection string` aparece en el código, cualquiera que obtenga el binario o el repositorio puede acceder a la base de datos.

 · Buenas prácticas que ya están en el proyecto

- `lib/db.ts` usa `process.env.DATABASE_URL`.
- `lib/auth.ts` usa `process.env.JWT_SECRET`.
- `.env.local` está ignorado por Git.
- `.env.example` está versionado como ejemplo.
- Los errores internos de la base de datos no se devuelven al cliente.

 · ¿Qué no debe ver el cliente?

Nunca devolver:

- errores crudos de PostgreSQL,
- stacks o mensajes con detalles de la base,
- el connection string o claves secretas.

En su lugar, la API responde con mensajes genéricos como:

- `Error interno`
- `No autorizado`
- `Not Found`

Eso reduce la información útil para un atacante.

 · Resumen

La seguridad de la API en este proyecto se basa en:

- validar la entrada con `zod`,
- usar consultas parametrizadas en todas las rutas,
- no exponer errores internos,
- guardar secretos en variables de entorno.
