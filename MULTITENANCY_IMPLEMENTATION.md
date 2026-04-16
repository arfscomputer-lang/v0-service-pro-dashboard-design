# Multitenancia en Assets - Implementación v0

## Arquitectura de Seguridad

### Control de Acceso por Rol

```
Admin/Supervisor:
  - Ven TODOS los activos del sistema
  - Pueden seleccionar cualquier cliente para crear/ver activos
  - Pueden eliminar activos

Cliente (role='cliente'):
  - Solo ven activos de SU cliente (filtrado por customer_id)
  - No pueden seleccionar cliente (está fijo)
  - Pueden crear activos solo para su cliente
  - Pueden eliminar sus propios activos
```

## Implementación Técnica

### 1. Base de Datos (Neon)
- Tabla `assets` con campo **customer_id (UUID, NOT NULL)**
- Foreign key: `customer_id` → `customers.id`
- Todos los activos deben estar vinculados a un cliente

### 2. Funciones DB (lib/db.ts)
- `getAssets()` - Todos los activos (sin filtro)
- `getAssetsByCustomer(customer_id)` - Activos de UN cliente
- `getAssetsDueForMaintenance(customer_id, days)` - Mantenimiento por vencer

### 3. API Endpoints Securizados

#### GET /api/assets
- Lee token del header `Authorization: Bearer <token>`
- Si role = admin/supervisor: devuelve TODOS
- Si role = cliente: devuelve SOLO su customer_id
- Query param `?customer_id=<id>` - filtro específico con validación de permisos

#### POST /api/assets
- Valida que `customer_id` sea obligatorio en body
- Si role = cliente: solo puede crear para su propio customer_id
- Si role = admin/supervisor: puede crear para cualquier customer

#### GET/PUT/DELETE /api/assets/[id]
- Obtiene asset existente
- Verifica que pertenece al cliente del usuario
- Admin/supervisor pueden acceder a cualquier asset

### 4. Contexto (assets-context.tsx)
- Hook `useAssets()` para acceder al estado global
- Métodos: `addAsset(customerId, data)`, `getAssetsByCustomer(customerId)`
- Sincroniza automáticamente con API

### 5. UI (app/activos/page.tsx)
- Muestra selector de cliente SOLO si user.role = admin/supervisor
- Usuario cliente ve info del cliente fijo (no puede cambiar)
- Listado filtrado automáticamente por displayCustomerId
- Validaciones en formul arios para evitar requests inválidas

## Flujo de Seguridad

```
1. Usuario inicia sesión
   ├─ Se almacena user.role y user.customerId (si aplica)
   └─ Se obtiene token de sesión

2. Usuario accede a /activos
   ├─ Si es admin/supervisor: ve selector de cliente
   └─ Si es cliente: ve solo su cliente

3. Usuario crea activo
   ├─ Frontend valida que customer_id esté seleccionado
   ├─ Envía POST con customer_id + datos
   ├─ API valida:
   │  ├─ Token válido
   │  ├─ customer_id requerido
   │  └─ Permiso: cliente solo puede crear para su customer_id
   ├─ Base de datos: constraint NOT NULL en customer_id previene orphans
   └─ Activo se vincula permanentemente al cliente

4. Usuario ve listado
   ├─ Frontend filtra por displayCustomerId
   ├─ API devuelve solo activos permitidos
   └─ Base de datos indexes en (customer_id, status) para performance
```

## Testing Multitenancia

### Caso 1: Admin crea activo para cliente A
```
1. Login como admin
2. Selecciona "Cliente A"
3. Crea activo
4. ✅ Activo visible en /activos con Cliente A
5. Cambia a "Cliente B"
6. ✅ El activo NO aparece
```

### Caso 2: Cliente solo ve sus activos
```
1. Login como cliente@empresaalfa.mx (customerId='cli-001')
2. NO hay selector de cliente
3. Ve solo activos donde customer_id='cli-001'
4. Intenta POST a /api/assets con customer_id='cli-002'
5. ✅ API rechaza con 403 Unauthorized
```

### Caso 3: Consulta directa de BD
```
SELECT * FROM assets WHERE customer_id = 'cli-001'
-- Solo retorna activos de Cliente A
```

## Validaciones Implementadas

### Frontend
- ✅ Campo customer_id obligatorio en form
- ✅ Selector de cliente solo para admin/supervisor
- ✅ Cliente vé solo su información fija
- ✅ Validación de campos antes de POST

### API
- ✅ Token obligatorio (Bearer token)
- ✅ Validación de sesión activa
- ✅ Verificación de permisos por rol
- ✅ customer_id match verification (cliente no puede crear para otro)
- ✅ 403 Unauthorized si acceso prohibido
- ✅ 400 Bad Request si datos inválidos

### Base de Datos
- ✅ Constraint: customer_id NOT NULL
- ✅ Foreign key: customer_id → customers.id
- ✅ Index: (customer_id, status) para queries rápidas
- ✅ RLS (Row Level Security) recomendado en el futuro

## Próximas Mejoras

1. **Row Level Security (RLS) en Neon**
   - Agregar política: usuarios solo ven activos de su customer_id
   - Protección en nivel BD, no solo en API

2. **Auditoría**
   - Log de quién creó/modificó/borró cada activo
   - Timestamp de cambios

3. **Soft Delete**
   - En lugar de eliminar, marcar deleted_at
   - Recuperación de datos accidentales

4. **API Rate Limiting por Cliente**
   - Evitar abuso de quota por tenant

5. **Caché por Cliente**
   - Redis con key: `assets:customer:{id}`
   - Invalidación automática al crear/actualizar
