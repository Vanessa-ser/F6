# Configuración Automática de API por Entorno

Esta configuración detecta automáticamente si estás usando la app en PC (web) o en móvil y usa la URL correspondiente de la API.

## URLs por Entorno

| Entorno | URL | Descripción |
|---------|-----|-------------|
| **Web (PC)** | `http://localhost:3000/api` | Accede al servidor local de tu PC |
| **Móvil** | `http://192.168.1.126:3000/api` | Accede al servidor desde el móvil en la red |
| **Producción** | `https://noteflow-eight-iota.vercel.app/api` | URL de Vercel (cuando compilas para producción) |

## Archivos Modificados

- **`config/api.ts`** - Nueva configuración centralizada que detecta el entorno automáticamente
- **`service/api_test.ts`** - Actualizado para usar la nueva configuración
- **`app.json`** - Agregada configuración de bundler para web

## Cómo Funciona

La configuración detecta automáticamente:

```typescript
import API_URL from '../config/api'

// En desarrollo:
// - Web (Platform.OS === 'web'): http://localhost:3000/api
// - Móvil (Android/iOS): http://192.168.1.126:3000/api

// En producción:
// - https://noteflow-eight-iota.vercel.app/api
```

## Uso en la App

### Para obtener la URL actual
```typescript
import API_URL from '../config/api'
console.log(API_URL) // Imprime la URL automática según el entorno
```

### Para acceso a configuración detallada
```typescript
import { apiConfig } from '../config/api'

console.log(apiConfig.platform)  // 'web', 'ios', 'android', etc
console.log(apiConfig.isDev)     // true/false
console.log(apiConfig.current)   // URL actual
```

## Cómo Ejecutar

### En Web (PC) en desarrollo
```bash
cd noteflow
npm run web
# O
yarn web
```
**Acceso:** `http://localhost:19006` (o similar)  
**API:** `http://localhost:3000/api` automáticamente

### En Móvil (Android/iOS)
```bash
cd noteflow
npm run android
# O
npm run ios
```
**API:** `http://192.168.1.126:3000/api` automáticamente

> ⚠️ **Nota:** Asegúrate de que tu móvil y PC estén en la misma red local (192.168.1.x)

### En Producción
Cuando compilas para producción, usa automáticamente:
```
https://noteflow-eight-iota.vercel.app/api
```

## Debuggear Problemas de Conexión

### Verificar qué URL está usando la app
1. Abre la consola en DevTools (web) o el terminal (móvil)
2. Deberías ver en los logs: `API_URL=http://localhost:3000/api` (o la del móvil)

### Desde Web (PC)
```typescript
import { apiConfig } from '../config/api'
console.log('Platform:', apiConfig.platform)  // debe ser 'web'
console.log('URL:', apiConfig.current)        // debe ser http://localhost:3000/api
```

### Desde Móvil
```typescript
import { apiConfig } from '../config/api'
console.log('Platform:', apiConfig.platform)  // debe ser 'android' o 'ios'
console.log('URL:', apiConfig.current)        // debe ser http://192.168.1.126:3000/api
```

### Verificar conectividad a la API

```typescript
// Desde web
fetch('http://localhost:3000/api/health')
  .then(r => r.json())
  .then(console.log)

// Desde móvil
fetch('http://192.168.1.126:3000/api/health')
  .then(r => r.json())
  .then(console.log)
```

## Cambiar IP de Móvil

Si cambias la IP del servidor en tu red, actualiza en `app.json`:

```json
{
  "expo": {
    "extra": {
      "DEV_API_URL": "http://TU_IP_AQUI:3000/api"
    }
  }
}
```

## Notas Importantes

- ✅ **Web/PC:** Usa `localhost` automáticamente
- ✅ **Móvil:** Lee `DEV_API_URL` del `app.json`
- ✅ **Producción:** Usa URL de Vercel automáticamente
- 🔄 **Sin cambios en el código:** Todo funciona automáticamente
