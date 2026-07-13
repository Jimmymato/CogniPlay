# CogniPlay

Plataforma web para la estimulación de funciones ejecutivas en niños con Trastorno del Espectro Autista (TEA) nivel 2. El sistema ofrece actividades interactivas con dificultad adaptativa: un motor de progresión evalúa cada intento del niño y decide automáticamente si sube, mantiene o reduce el nivel, o si asigna un refuerzo. El terapeuta cuenta con un panel de gestión, seguimiento individual con gráficos de evolución y reportes por periodo exportables a PDF y Excel.

## Objetivo

Apoyar la intervención terapéutica mediante juegos breves que ejercitan siete funciones ejecutivas (razonamiento, flexibilidad cognitiva, inhibición, toma de decisiones, estimación temporal, ejecución dual y multitarea), registrando cada intento y generando información útil y **no diagnóstica** para el terapeuta.

## Tecnologías

| Capa | Tecnología |
|---|---|
| Backend | Node.js (ESM) + TypeScript ejecutado con **tsx** (sin paso de compilación), Express 5 |
| Base de datos | PostgreSQL + **Prisma 7** (driver adapter `@prisma/adapter-pg`) |
| Autenticación | JWT (`jsonwebtoken`) + `bcryptjs` |
| Pruebas | Vitest + Supertest (34 pruebas) |
| Frontend | React 19 + Vite 8 (JSX), React Router 7, Axios, Recharts, lucide-react |
| Estilos | CSS con tokens de diseño propios (`src/estilos/tokens.css`), fuentes Geist locales |

## Requisitos previos

- **Node.js 22 LTS** (mínimo 20.19).
- **PostgreSQL 16** o superior (sirve 14+), corriendo en local.
- npm (incluido con Node).

## Instalación

### 1. Base de datos

Crear una base vacía llamada `cogniplay` (el nombre puede cambiarse mientras coincida con `DATABASE_URL`):

```sql
CREATE DATABASE cogniplay;
```

### 2. Backend

```bash
cd backend
npm install
```

Copiar `.env.example` a `.env` y completar los valores (ver [Variables de entorno](#variables-de-entorno)):

```bash
cp .env.example .env
```

Aplicar las migraciones (crea las 15 tablas y los enums; también genera el cliente Prisma):

```bash
npm run prisma:migrate
```

Cargar los datos iniciales (idempotente, puede re-ejecutarse sin duplicar):

```bash
npm run seed
```

El seed crea:
- Las **7 funciones ejecutivas** con su color e ícono.
- **7 actividades** (una por función) con 3 niveles cada una — Fácil (5 ítems, 60 s), Medio (8 ítems, 45 s), Difícil (10 ítems, 30 s).
- Dos usuarios de prueba (ver [Credenciales](#credenciales-de-prueba)).

Iniciar el servidor de desarrollo (recarga automática con `tsx watch`):

```bash
npm run dev
```

El API queda en `http://localhost:4000`. Comprobación rápida: `GET http://localhost:4000/salud`.

> Nota: después de ejecutar `prisma migrate` o `prisma generate` con el servidor corriendo, hay que **reiniciar** `npm run dev` — el proceso mantiene en memoria el cliente Prisma anterior.

### 3. Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

La aplicación queda en `http://localhost:5173` (Vite). Requiere el backend corriendo.

## Variables de entorno

### Backend (`backend/.env`)

| Variable | Obligatoria | Descripción |
|---|---|---|
| `DATABASE_URL` | Sí | Cadena de conexión PostgreSQL: `postgresql://usuario:contraseña@host:5432/cogniplay` |
| `JWT_SECRET` | Sí | Clave para firmar los tokens. Usar una cadena larga y aleatoria |
| `PORT` | No (defecto 4000) | Puerto del servidor Express |
| `JWT_EXPIRACION` | No (defecto `7d`) | Vigencia del token (`7d`, `24h`, `60m`) |
| `CORS_ORIGEN` | No (defecto: todos) | Orígenes permitidos para CORS, separados por coma. Ej.: `http://localhost:5173,https://cogniplay.ejemplo.com` |

En Prisma 7 la URL **no** va en `schema.prisma`: el CLI la lee desde `prisma.config.ts` y el runtime desde el adaptador (`src/config/prisma.ts`).

### Frontend (`frontend/.env`)

| Variable | Descripción |
|---|---|
| `VITE_API_URL` | URL base del API, con el prefijo `/api`. En desarrollo: `http://localhost:4000/api` |

## Credenciales de prueba

| Rol | Correo | Contraseña |
|---|---|---|
| Terapeuta | `terapeuta@test.com` | `123456` |
| Niño | `nino@test.com` | `123456` |

## Estructura del proyecto

```
CogniPlay/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma        # 15 modelos + enums (identificadores en español)
│   │   ├── migrations/          # Migraciones aplicadas
│   │   └── seed.ts              # Datos iniciales idempotentes
│   └── src/
│       ├── config/              # entorno.ts (lectura de .env), prisma.ts (cliente singleton)
│       ├── middlewares/         # autenticacion.ts (autenticar/autorizar), manejadorErrores.ts
│       ├── utiles/              # errores (ErrorHttp), contrasena, jwt, perfiles, fechas
│       ├── modulos/             # Un directorio por módulo: <modulo>.{rutas,controlador,servicio}.ts
│       │   ├── autenticacion/   # Login y perfil (/api/autenticacion)
│       │   ├── ninos/           # CRUD de niños del terapeuta (/api/ninos)
│       │   ├── catalogo/        # Funciones y actividades (/api/funciones, /api/actividades)
│       │   ├── sesiones/        # Sesiones de trabajo y su cierre (/api/sesiones)
│       │   ├── intentos/        # Registro de intentos del niño (/api/intentos)
│       │   ├── progreso/        # Motor adaptativo (reglas puras + servicio) y lecturas
│       │   ├── refuerzos/       # Refuerzos automáticos y manuales (/api/refuerzos)
│       │   ├── recomendaciones/ # Textos por reglas al cerrar sesión
│       │   ├── notificaciones/  # Avisos al terapeuta (/api/notificaciones)
│       │   ├── observaciones/   # Notas del terapeuta por niño (/api/observaciones)
│       │   └── reportes/        # Resumen, historial y exportación PDF/Excel (/api/reportes)
│       ├── pruebas/             # Pruebas de integración del API (Vitest + Supertest)
│       ├── app.ts               # App Express (exportada sin listen, usada por las pruebas)
│       └── servidor.ts          # Punto de entrada
├── frontend/
│   └── src/
│       ├── app/enrutador/       # Enrutador (lazy), RutaProtegida, rutas.js centralizadas
│       ├── caracteristicas/
│       │   ├── autenticacion/   # ContextoAuth (useAuth) + PantallaLogin
│       │   ├── tableroNino/     # Panel del niño (actividades por función)
│       │   ├── actividades/     # Reproductor de actividades + juegos/ (los 7 juegos)
│       │   ├── tableroTerapeuta/# Dashboard, alta de niños, detalle/ (vista individual)
│       │   └── reportes/        # Reportes con gráficos y resumen de apoyo
│       ├── componentes/         # BarraSuperior, TarjetaActividad, modales, etc.
│       ├── servicios/           # clienteApi.js (Axios + interceptores) y un servicio por recurso
│       ├── constantes/          # Claves de almacenamiento local
│       └── estilos/             # tokens.css (colores, tipografía, espaciado)
├── diseño/                      # Prototipos visuales (HTML/JSX) y tokens de referencia
├── diseño-base-de-datos.md      # Documento de diseño de la base de datos (Fase 1)
├── avance-backend-fase-4.md     # Bitácoras de desarrollo por fase
├── avance-frontend-fase-5.md
└── avance-pruebas-fase-6.md
```

Reglas de arquitectura del backend: las **rutas** solo declaran middlewares y delegan al controlador; los **controladores** validan entrada y forman la respuesta; los **servicios** contienen la lógica y el acceso a datos vía Prisma. Los componentes del frontend nunca llaman HTTP directo: siempre pasan por `servicios/`.

## Comandos disponibles

### Backend (`cd backend`)

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo con recarga (`tsx watch`) |
| `npm start` | Servidor sin recarga |
| `npm run prisma:migrate` | Aplica migraciones (`prisma migrate dev`) |
| `npm run prisma:generate` | Regenera el cliente Prisma |
| `npm run seed` | Carga datos iniciales |
| `npm run typecheck` | Verificación de tipos (`tsc --noEmit`) |
| `npm test` | Ejecuta las pruebas una vez |
| `npm run test:watch` | Pruebas en modo observador |

### Frontend (`cd frontend`)

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo Vite |
| `npm run build` | Build de producción (`dist/`) |
| `npm run preview` | Sirve el build para verificación |
| `npm run lint` | Linter (oxlint) |

## Pruebas

Las 34 pruebas del backend se ejecutan con:

```bash
cd backend
npm test
```

- **Unitarias** (`src/modulos/progreso/progreso.reglas.test.ts`): 20 pruebas del motor adaptativo, incluyendo las fronteras exactas de los umbrales (85/84, 60/59, 40/39).
- **Integración** (`src/pruebas/*.api.test.ts`): login, autorización por rol, aislamiento entre terapeutas, registro de intentos y sus validaciones (suma de ítems, actividad bloqueada, sesión cerrada).

Las pruebas de integración usan la base de datos real: requieren **PostgreSQL activo y el seed aplicado**. Crean sus propios datos vía API y los eliminan al terminar.

## Motor adaptativo de progresión

Vive en `backend/src/modulos/progreso/`. La función `evaluarProgresion` (`progreso.reglas.ts`) es **pura** — recibe la precisión del intento, el nivel actual y si fue completado, y devuelve una decisión sin tocar la base de datos — lo que permite probarla de forma aislada. `aplicarProgresion` (`progreso.servicio.ts`) persiste la decisión **dentro de la misma transacción** en la que se registra el intento, de modo que intento y decisión son atómicos.

Umbrales sobre la precisión del intento (porcentaje de aciertos):

| Precisión | Decisión |
|---|---|
| ≥ 85 %, completado y sin omisiones | **AUMENTAR_DIFICULTAD** (si ya está en Difícil: **DESBLOQUEAR_SIGUIENTE_ACTIVIDAD**) |
| ≥ 85 % pero con omisiones | MANTENER_DIFICULTAD |
| 60 – 84 % | MANTENER_DIFICULTAD |
| 40 – 59 % | REDUCIR_DIFICULTAD (si ya está en Fácil: REPETIR_ACTIVIDAD) |
| < 40 % | **ASIGNAR_REFUERZO** (crea un refuerzo pendiente y notifica al terapeuta; si ya existe uno activo para esa actividad, no duplica) |

**Ejemplo:** un niño juega «Espera la Señal» en nivel Medio (8 ítems) y acierta 7 sin omisiones → precisión 87.5 %, completado → decisión `AUMENTAR_DIFICULTAD` y su progreso pasa a Difícil. La respuesta de `POST /api/intentos` incluye la decisión:

```json
{
  "precision": "87.5",
  "completado": true,
  "progresion": {
    "decision": { "decision": "AUMENTAR_DIFICULTAD", "precisionEvaluada": 87.5 },
    "progreso": { "nivelActual": "DIFICIL", "nivelSuperado": false },
    "refuerzo": null
  }
}
```

Si en cambio acierta 2 de 8 (25 %) → `ASIGNAR_REFUERZO`: se crea un `Refuerzo` en estado `PENDIENTE` y una notificación para el terapeuta, todo en la misma transacción del intento.

El terapeuta también puede intervenir manualmente desde la vista del niño (cambiar nivel, bloquear/desbloquear una actividad); esas acciones quedan registradas como decisiones manuales (`automatica: false`).

## Exportación de reportes

Desde la pantalla **Reportes** el terapeuta puede descargar el reporte del niño y periodo seleccionados en **PDF** (documento con resumen, desglose por función, áreas destacadas, resumen de apoyo e historial de intentos) o **Excel** (hojas «Resumen» e «Historial»). Los archivos se generan en el backend (`GET /api/reportes/exportar?ninoId=&desde=&hasta=&formato=pdf|xlsx`, con `pdfkit` y `exceljs`) a partir de los mismos datos que muestra la pantalla, por lo que las cifras siempre coinciden. El API anuncia los formatos disponibles en `exportacion.formatos`.

## Limitaciones y versiones futuras

- **Recomendaciones**: se generan por reglas fijas en el backend (v1); una versión futura podría hacerlas configurables o basadas en plantillas.
- **Asignación**: cada niño pertenece a un solo terapeuta; no hay equipos ni co-terapeutas.
- **Cuentas**: no hay registro público ni recuperación de contraseña — los terapeutas se crean por seed/administración y los niños desde el panel del terapeuta.
- **CORS**: por defecto acepta cualquier origen (cómodo en desarrollo local); para un despliegue real, definir `CORS_ORIGEN` en el `.env` del backend con los orígenes permitidos separados por coma (ej. `CORS_ORIGEN=https://cogniplay.ejemplo.com`).
- El token JWT se guarda en `localStorage`; para producción convendría evaluar cookies `httpOnly`.
- Los textos del sistema son informativos y de apoyo; **no constituyen diagnóstico clínico**.
