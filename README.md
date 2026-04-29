# Trajectory Microservice

Microservicio responsable del registro y consulta de la **trayectoria profesional** de los empleados: historial de eventos de carrera y evaluaciones de desempeño. Se comunica exclusivamente a través de NATS como broker de mensajes.

## Tabla de Contenidos

- [Trajectory Microservice](#trajectory-microservice)
  - [Tabla de Contenidos](#tabla-de-contenidos)
  - [Descripción General](#descripción-general)
  - [Arquitectura y Módulos](#arquitectura-y-módulos)
  - [Modelos de Base de Datos](#modelos-de-base-de-datos)
    - [`career_history`](#career_history)
    - [`performance_evaluations`](#performance_evaluations)
  - [Mensajes NATS (API Interna)](#mensajes-nats-api-interna)
    - [Historial de Carrera](#historial-de-carrera)
    - [Evaluaciones de Desempeño](#evaluaciones-de-desempeño)
  - [Variables de Entorno](#variables-de-entorno)
  - [Instalación y Ejecución](#instalación-y-ejecución)
    - [Modo desarrollo (local)](#modo-desarrollo-local)
    - [Modo Docker (recomendado)](#modo-docker-recomendado)
      - [Esto no es necesario si se quiere ejecutar todo el proyecto desde el launcher: **Leer README.md del launcher**](#esto-no-es-necesario-si-se-quiere-ejecutar-todo-el-proyecto-desde-el-launcher-leer-readmemd-del-launcher)
    - [Migraciones de base de datos](#migraciones-de-base-de-datos)
  - [Estructura del Proyecto](#estructura-del-proyecto)

---

## Descripción General

Este microservicio centraliza el historial de progresión profesional de cada empleado dentro de la organización. Permite registrar cualquier tipo de evento de carrera (promociones, traslados, cambios salariales, entre otros) y asociar evaluaciones de desempeño a dichos eventos. Es el núcleo del módulo de trayectoria del sistema.

**Características destacadas:**
- Registro de 5 tipos de eventos de carrera: `promotion`, `transfer`, `contract_modification`, `salary_change`, `evaluation`
- Evaluaciones de desempeño vinculables a un evento de historial de carrera
- Paginación consistente en todas las consultas de listado
- Validación estricta de DTOs de entrada

---

## Arquitectura y Módulos

```
AppModule
├── CareerHistoryModule          → Registro de eventos de carrera del empleado
└── PerformanceEvaluationModule  → Evaluaciones de desempeño
```

Cada módulo sigue el patrón estándar de NestJS:
`Controller (MessagePattern) → Service → Prisma (PostgreSQL)`

---

## Modelos de Base de Datos

### `career_history`
Registro de un evento de progresión profesional de un empleado.

| Campo           | Tipo                      | Descripción                                         |
|-----------------|---------------------------|-----------------------------------------------------|
| `id`            | `String` (UUID)           | Identificador único                                 |
| `employee_id`   | `String`                  | Referencia al empleado afectado                     |
| `type`          | `career_history_type`     | Tipo de evento de carrera                           |
| `description`   | `String`                  | Descripción detallada del evento                    |
| `previous_value`| `String?`                 | Valor anterior (cargo, salario, etc.) antes del cambio |
| `new_value`     | `String?`                 | Nuevo valor tras el cambio                          |
| `event_date`    | `DateTime`                | Fecha en que ocurrió el evento                      |
| `created_at`    | `DateTime`                | Fecha de registro                                   |

**Tipos de evento de carrera:**

| Valor                  | Descripción                               |
|------------------------|-------------------------------------------|
| `promotion`            | Ascenso de cargo                          |
| `transfer`             | Traslado de área o sede                   |
| `contract_modification`| Cambio en las condiciones del contrato    |
| `salary_change`        | Modificación salarial                     |
| `evaluation`           | Evaluación de desempeño formal            |

### `performance_evaluations`
Evaluación de desempeño de un empleado, opcionalmente vinculada a un evento de historial.

| Campo                | Tipo            | Descripción                                               |
|----------------------|-----------------|-----------------------------------------------------------|
| `id`                 | `String` (UUID) | Identificador único                                       |
| `employee_id`        | `String`        | Referencia al empleado evaluado                           |
| `evaluator_id`       | `String`        | Referencia al evaluador (administrador o manager)         |
| `career_history_id`  | `String?`       | Evento de carrera asociado (nullable)                     |
| `score`              | `Float`         | Puntuación obtenida en la evaluación                      |
| `observations`       | `String?`       | Comentarios y observaciones del evaluador                 |
| `evaluation_date`    | `DateTime`      | Fecha de la evaluación                                    |
| `created_at`         | `DateTime`      | Fecha de registro                                         |

**Relación entre modelos:**

```
career_history (1) ──── (0..1) performance_evaluations
```

Una evaluación puede existir de forma independiente o vincularse a un evento de carrera de tipo `evaluation`.

---

## Mensajes NATS (API Interna)

Todos los mensajes se envían con el patrón `{ cmd: '<accion>' }`.

### Historial de Carrera

| `cmd`                   | Payload                                      | Descripción                              |
|-------------------------|----------------------------------------------|------------------------------------------|
| `createCareerHistory`   | `CreateCareerHistoryDto`                     | Registrar nuevo evento de carrera        |
| `findAllCareerHistory`  | `PaginationDto`                              | Listar eventos con paginación            |
| `findOneCareerHistory`  | `{ id: string }`                             | Obtener evento por ID                    |
| `updateCareerHistory`   | `{ id: string } & UpdateCareerHistoryDto`    | Actualizar evento de carrera             |
| `removeCareerHistory`   | `{ id: string }`                             | Eliminar evento de carrera               |

### Evaluaciones de Desempeño

| `cmd`                            | Payload                                             | Descripción                              |
|----------------------------------|-----------------------------------------------------|------------------------------------------|
| `createPerformanceEvaluation`    | `CreatePerformanceEvaluationDto`                    | Registrar nueva evaluación               |
| `findAllPerformanceEvaluation`   | `PaginationDto`                                     | Listar evaluaciones con paginación       |
| `findOnePerformanceEvaluation`   | `{ id: string }`                                    | Obtener evaluación por ID                |
| `updatePerformanceEvaluation`    | `{ id: string } & UpdatePerformanceEvaluationDto`   | Actualizar evaluación                    |
| `removePerformanceEvaluation`    | `{ id: string }`                                    | Eliminar evaluación                      |

---

## Variables de Entorno

| Variable       | Descripción                                              |
|----------------|----------------------------------------------------------|
| `PORT`         | Puerto interno del microservicio (default: `3003`)       |
| `NATS_SERVERS` | URL del servidor NATS (ej: `nats://nats-server:4222`)    |
| `DATABASE_URL` | Cadena de conexión PostgreSQL (Supabase)                 |

---

## Instalación y Ejecución

### Modo desarrollo (local)

```bash
npm install
npm run start:dev
```

### Modo Docker (recomendado)

#### Esto no es necesario si se quiere ejecutar todo el proyecto desde el launcher: **Leer README.md del launcher**

```bash
# Desde la raíz del launcher
docker compose up trajectory-ms
```

### Migraciones de base de datos

```bash
npx prisma db pull
npx prisma generate
```

---

## Estructura del Proyecto

```
src/
├── main.ts                                      # Bootstrap como microservicio NATS
├── app.module.ts                                # Módulo raíz
├── career-history/
│   ├── career-history.controller.ts             # MessagePatterns de historial de carrera
│   ├── career-history.service.ts                # Lógica de negocio
│   ├── career-history.module.ts
│   ├── dto/
│   │   ├── create-career-history.dto.ts
│   │   ├── update-career-history.dto.ts
│   │   └── index.ts
│   └── enum/
│       └── career_type_change.ts                # Enum de tipos de evento
├── performance-evaluation/
│   ├── performance-evaluation.controller.ts     # MessagePatterns de evaluaciones
│   ├── performance-evaluation.service.ts        # Lógica de negocio
│   ├── performance-evaluation.module.ts
│   └── dto/
│       ├── create-performance-evaluation.dto.ts
│       ├── update-performance-evaluation.dto.ts
│       └── index.ts
├── lib/
│   └── prisma.ts                                # PrismaClient con adaptador pg
├── config/
│   ├── envs.ts                                  # Validación de variables de entorno (Joi)
│   ├── index.ts
│   └── services.ts                              # Constante NATS_SERVICE
├── transports/
│   └── nats.module.ts                           # ClientsModule NATS
└── common/
    ├── dto/pagination.dto.ts
    ├── exceptions/rpc-custom-exception.filter.ts
    └── index.ts
```
