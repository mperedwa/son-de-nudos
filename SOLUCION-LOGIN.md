# Solución al Problema de Login del Admin Panel

> **Documento histórico.** La instancia Supabase usada durante este diagnóstico ya no está disponible. No reutilices credenciales, IDs ni comandos de esta guía en una instancia nueva.

## Diagnóstico Completo

Después de exhaustivas pruebas, se confirmó que:

✅ **TODO FUNCIONA CORRECTAMENTE:**
- Base de datos configurada correctamente
- RLS habilitado y funcionando
- Políticas aplicadas correctamente
- Usuario admin creado correctamente
- IDs coinciden entre auth.users y tabla admins
- Script de test funciona perfectamente

❌ **EL PROBLEMA REAL:**
Extensiones de Chrome interfiriendo con las peticiones HTTP

## Evidencias

### 1. Script de Test Funciona
```bash
npm run test-login-flow
# ✅ Login exitoso
# ✅ Registro de admin obtenido
# ✅ RLS funcionando correctamente
```

### 2. Navegador Falla con Errores de Extensiones
```
Error handling response: TypeError: Cannot read properties of null (reading 'postMessage')
chrome-extension://... errors
```

### 3. Peticiones HTTP Bloqueadas
El error "502 Bad Gateway" + CORS es causado por extensiones bloqueando las peticiones.

## Solución

### Opción 1: Modo Incógnito (RECOMENDADO)
1. Abre Chrome en modo incógnito: `Cmd+Shift+N` (Mac) o `Ctrl+Shift+N` (Windows)
2. Ve a: http://localhost:5174/admin/login
3. Ingresa:
   - Email del administrador vigente
   - Contraseña almacenada en el gestor de contraseñas
4. ✅ Debería funcionar perfectamente

### Opción 2: Deshabilitar Extensiones Temporalmente
1. Ve a `chrome://extensions`
2. Deshabilita TODAS las extensiones temporalmente
3. Refresca la página de login
4. Intenta hacer login
5. ✅ Debería funcionar

### Opción 3: Usar Otro Navegador
- Firefox
- Safari
- Edge

## Extensiones Problemáticas Comunes

Las siguientes extensiones suelen interferir con peticiones HTTP/HTTPS:
- Ad blockers (uBlock Origin, AdBlock Plus)
- Privacy extensions (Privacy Badger)
- Security extensions (HTTPS Everywhere)
- Developer tools extensions
- React Developer Tools (puede interferir)

## Verificación Post-Solución

Después de hacer login exitosamente, deberías ver:

1. Redirección a `/admin/dashboard`
2. Dashboard con estadísticas
3. Sidebar con menú de navegación
4. Sin errores en la consola

## Credenciales del Admin

No hay credenciales por defecto. Deben crearse para la instancia vigente con `npm run create:admin` y conservarse fuera del repositorio.

## Para Cambiar la Contraseña

Si quieres cambiar la contraseña, usa el formulario `/admin/profile` o el dashboard de autenticación de la instancia vigente. No pases contraseñas mediante argumentos de shell ni scripts temporales.

## Conclusión

En noviembre de 2025 el problema observado se atribuyó a extensiones del navegador. Esta conclusión no representa el estado actual; la recuperación de Supabase debe completarse y validarse nuevamente.
