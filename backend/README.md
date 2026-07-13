# CogniPlay — Backend

API REST de CogniPlay construida con Node.js + TypeScript (tsx), Express 5 y Prisma 7 sobre PostgreSQL.

La documentación completa del proyecto (instalación, variables de entorno, estructura, motor adaptativo y pruebas) está en el [README de la raíz](../README.md).

## Inicio rápido

```bash
npm install
cp .env.example .env      # completar DATABASE_URL y JWT_SECRET
npm run prisma:migrate    # aplica migraciones y genera el cliente
npm run seed              # funciones, actividades y usuarios de prueba
npm run dev               # http://localhost:4000 (comprobar GET /salud)
```

## Comandos

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor con recarga (`tsx watch`) |
| `npm start` | Servidor sin recarga |
| `npm run prisma:migrate` | `prisma migrate dev` |
| `npm run prisma:generate` | Regenera el cliente Prisma |
| `npm run seed` | Datos iniciales (idempotente) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Pruebas (Vitest + Supertest; requiere BD activa y seed) |
