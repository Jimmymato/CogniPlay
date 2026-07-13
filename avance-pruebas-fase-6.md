# CogniPlay — Fase 6: Pruebas (2026-07-04)

**Herramientas:** [Vitest](https://vitest.dev) como runner (corre TypeScript ESM sin configuración, encaja con el stack `tsx`) y **Supertest** para las pruebas de integración (ejecuta peticiones HTTP contra la app Express exportada en `src/app.ts`, sin levantar servidor ni ocupar el puerto 4000). Las suites de integración usan la base de datos de desarrollo con los usuarios del seed; **todo lo que crean lo eliminan al terminar** (verificado: cero residuos).

Comandos: `npm test` (una corrida) · `npm run test:watch` (modo watch).

**Resultado: 3 archivos, 34 pruebas, todas en verde.** `npm run typecheck` limpio.

---

## 6.1 — Motor adaptativo (`src/modulos/progreso/progreso.reglas.test.ts`, 20 pruebas)

Pruebas **unitarias puras** de `evaluarProgresion`, `nivelSiguiente` y `nivelPrevio` (sin BD). Cubren:

- Desempeño alto (≥85 completado): sube FACIL→MEDIO y MEDIO→DIFICIL (`AUMENTAR_DIFICULTAD`); en DIFICIL supera la actividad (`DESBLOQUEAR_SIGUIENTE_ACTIVIDAD` + `nivelSuperado`).
- ≥85 **con omisiones** → `MANTENER_DIFICULTAD` (no se promueve).
- Medio (60–84) → `MANTENER_DIFICULTAD` en los tres niveles.
- Bajo (40–59) → `REDUCIR_DIFICULTAD` (DIFICIL→MEDIO, MEDIO→FACIL); en FACIL → `REPETIR_ACTIVIDAD`.
- Muy bajo (<40) → `ASIGNAR_REFUERZO` + `asignarRefuerzo`, sin cambiar el nivel.
- **Valores frontera exactos**: 85 (alto), 84 (medio), 60, 59, 40 (bajo, no refuerzo), 39.
- Contrato: `nivelAnterior` siempre presente y `razon` legible en las 21 combinaciones nivel×precisión.

> Nota de mapeo con el spec: el PROMPT_MAESTRO menciona reglas por historial ("dos aciertos consecutivos", "un fallo aislado"). El motor aprobado en la Subfase 4.6 decide **por intento** con los umbrales 85/60/40; las pruebas validan esas reglas reales. La intención del spec queda cubierta: el desempeño alto sostenido termina desbloqueando (cada ≥85 sube un nivel hasta superar), y un fallo aislado en franja media (60–84) **no** reduce el nivel.

## 6.2 — Autenticación y autorización (`src/pruebas/autenticacion.api.test.ts`, 8 pruebas)

- Login correcto → 200 con `token` y datos públicos (sin `contrasenaHash`).
- Contraseña incorrecta y correo inexistente → **401** (sin revelar cuál falló).
- Ruta de terapeuta (`GET /api/ninos`) con token de niño → **403**.
- Ruta protegida sin token → **401**; token inválido → **401**.
- **Aislamiento entre terapeutas**: se crea un segundo terapeuta real (directo en BD, `cifrarContrasena`) y se comprueba que el niño del primero le devuelve **404** en `GET /ninos/:id`, `GET /intentos?ninoId=` y `GET /progreso?ninoId=` (no existe para él, no 403 — no filtra existencia). Se elimina al final.

## 6.3 — Flujo de intento (`src/pruebas/intentos.api.test.ts`, 6 pruebas)

Flujo end-to-end con un niño de prueba creado por la vía oficial (`POST /api/ninos`) y dos actividades reales del catálogo (nivel FACIL):

- Intento perfecto → **201**, `precision` 100, `completado`, y la decisión del motor en la misma respuesta (`progresion.decision.decision === 'AUMENTAR_DIFICULTAD'`, `progreso.nivelActual === 'MEDIO'`) — intento + decisión atómicos.
- `POST /api/intentos` con token de terapeuta → **403** (solo rol NINO).
- Conteos que no suman el `totalItems` del nivel → **400**.
- Actividad inexistente → **404**.
- Actividad **bloqueada** por el terapeuta (`PATCH /api/progreso/bloqueo`) → **409**.
- Sesión **cerrada** no acepta intentos → **400** ("La sesión no está en curso"). Es el equivalente real del "intento ya finalizado" del spec: los intentos se envían completos y atómicos, no existe estado "iniciado".

**Limpieza:** `afterAll` borra en orden de dependencias (decisiones → notificaciones → refuerzos → intentos → recomendaciones → resúmenes → sesiones → progreso → niño → usuario por **correo único**).

> ⚠️ Lección de la primera corrida: `deleteMany({ where: { id: undefined } })` en Prisma **ignora el filtro** e intenta borrar toda la tabla (lo frenó el FK del terapeuta). Por eso el usuario de prueba se elimina por su correo único y la limpieza va tras un guard `if (ninoId)`.

---

## Siguiente paso

**Fase 7 — Documentación:** 7.1 README completo (instalación, credenciales, estructura, motor adaptativo con ejemplo, limitaciones) y 7.2 `.env.example` comentado.
