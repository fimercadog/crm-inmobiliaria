# Modo contingencia — arquitectura

V1: un módulo (Seguimientos/Activities), arquitectura extensible a más.
Ver el informe de la conversación para la auditoría completa de módulos.

## Piezas

**Backend** (`backend/app/Contingency/`, `backend/app/Models/Contingency*.php`)

- `ContingencyModuleRegistry` — código, no base de datos: qué módulos son
  técnicamente elegibles. Separado de `ContingencySession.enabled_modules`
  (dato: qué módulos están habilitados *ahora*, elegido por el admin en cada
  activación).
- `ContingencySession` — una fila por ciclo de activación. Server-side
  porque el estado "¿está activa la contingencia?" debe ser visible para
  todos los usuarios, no solo el navegador que la activó.
- `ContingencyEvent` — log de auditoría append-only (activar/desactivar/
  sync/descarte). Nunca se borra evidencia.
- Gate `manage-contingency` — reutiliza `$user->isAdmin()`. No se crearon
  permisos granulares nuevos (alcance reducido, decisión del usuario).
- Idempotencia — `activities.client_uuid` (único) + `ActivityService::
  create()` usa `firstOrCreate`. Sincronizar la misma transacción dos veces
  nunca duplica el registro.
- La sincronización reutiliza el endpoint real `POST /activities` — no hay
  un endpoint paralelo que se salte validación/políticas/reglas de negocio.

**Frontend** (`frontend/src/features/contingency/`, `frontend/src/lib/offline/`)

- `OfflineStorageInterface` (`lib/offline/offline-storage.ts`) — abstracción
  de almacenamiento local. Única implementación real: `IndexedDBOfflineStorage`
  (es lo único que tiene sentido en un navegador; no hay filesystem/SQLite
  desde Next.js client). Un proveedor futuro (por ejemplo SQLite en un shell
  de escritorio) es una implementación nueva de esta misma interfaz.
- `ContingencyModuleAdapter` (`features/contingency/module-registry.ts`) —
  un adapter por módulo contingente: cómo resumir una transacción para la
  pantalla de gestión, y cómo sincronizarla (llamando al endpoint real).
- `ContingencyProvider` (`features/contingency/contingency-context.tsx`) —
  el "ContingencyManager": estado de sesión, cola de transacciones, activar/
  desactivar/encolar/sincronizar/descartar.
- `ContingencyBanner` — indicador persistente en todas las páginas
  autenticadas.
- `ContingencySettingsView` — configuración + activación + gestión de
  transacciones (una sola pantalla, alcance reducido).

## Cómo agregar un módulo nuevo

1. **Backend**: agregar una entrada en `ContingencyModuleRegistry::eligible()`
   con `key`, `label`, `description`. Si el módulo necesita idempotencia,
   agregar una columna `client_uuid` única a su tabla (migración) y usar
   `firstOrCreate` en su Service, igual que `ActivityService`.
2. **Frontend**: agregar un `ContingencyModuleAdapter` en
   `module-registry.ts` (cómo resumir el payload, cómo sincronizar contra
   el endpoint real de ese módulo).
3. Donde se cree el registro de ese módulo (su página `new` o su formulario),
   revisar `isModuleEnabled(key)` de `useContingency()`: si está habilitado,
   `queue(key, "create", values)` en vez de llamar la API directamente.
4. Si el módulo tiene un enlace de "Nuevo X" en el sidebar (`writeOnly: true`
   en `constants/navigation.ts`), decidir si debe ocultarse durante
   contingencia — hoy `app-sidebar.tsx` oculta *todos* los `writeOnly`
   mientras la contingencia está activa (no distingue por módulo, ver
   limitaciones abajo).

Nada de lo anterior requiere tocar `ContingencyProvider`, `ContingencySession`,
ni el flujo de activación/desactivación — son genéricos.

## Limitaciones conocidas de este V1 (documentadas, no ocultas)

- **Solo lectura aplicado a 2 módulos como demostración** (Propiedades,
  Clientes), no a los ~10 módulos del CRM. Extenderlo es mecánico: repetir
  el mismo patrón (`canWrite = roleCanWrite && !isReadOnly("modulo")`) en
  cada tabla — ver `properties-table.tsx` / `clients-table.tsx`.
- **Sidebar `writeOnly` no distingue módulo**: oculta todos los atajos de
  "Nuevo X" mientras contingencia está activa, sin importar cuál módulo.
  Correcto hoy (ningún módulo habilitado tiene atajo de sidebar), pero si un
  futuro módulo contingente SÍ lo tiene, habrá que agregar una clave de
  módulo a `NavGroup.items` en vez de un booleano genérico.
- **Resolución de conflictos simplificada**: un CONFLICT/FAILED solo se
  puede reintentar o descartar (con motivo) — no hay una pantalla guiada de
  reconciliación campo por campo. Para Seguimientos esto es aceptable (es
  aditivo, casi nunca genera conflicto real); para un módulo con reglas más
  complejas convendría construir esa pantalla antes de habilitarlo.
- **Permisos reducidos a un solo gate** (`manage-contingency` = Admin) en
  vez de los 7 permisos granulares del brief original
  (`contingencia.activar`, `.sincronizar`, `.descartar`, etc.).
