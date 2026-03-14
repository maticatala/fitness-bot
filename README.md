# Fitness Bot 🤖💪

WhatsApp bot built with NestJS that sends daily workout summaries to a group, consuming data from [fitness-backend](https://github.com/matiasncatala/fitness-backend).

## How it works

```
Fitness Backend (NestJS)
        ↓
  Scheduler (21:00 hs)
        ↓
  Evolution API (Docker)
        ↓
  WhatsApp Group
```

## Requirements

- Node.js 18+
- Docker & Docker Compose
- A WhatsApp account to link to the bot
- [fitness-backend](https://github.com/matiasncatala/fitness-backend) running

## Setup

### 1. Configure Evolution API

Navigate to the `docker/evolution-api-postgres` folder and create the environment files from their templates:

```bash
cp docker/evolution-api-postgres/db.env.template docker/evolution-api-postgres/db.env
cp docker/evolution-api-postgres/evolution.env.template docker/evolution-api-postgres/evolution.env
```

Fill in the values in both files.

### 2. Start Docker services

```bash
cd docker/evolution-api-postgres
docker-compose up -d
```

This will start:

- **Evolution API** on `http://localhost:8081`
- **PostgreSQL** as the database for Evolution API
- **Redis** for caching

### 3. Link your WhatsApp

1. Go to `http://localhost:8081/manager`
2. Create a new instance (e.g. `fitness-bot`)
3. Scan the QR code with your WhatsApp

### 4. Install dependencies

Back in the project root:

```bash
npm install
```

### 5. Configure environment variables

```bash
cp .env.template .env
```

Fill in the values in `.env`:

| Variable                | Description                                       |
| ----------------------- | ------------------------------------------------- |
| `EVOLUTION_API_URL`     | Evolution API URL (e.g. `http://localhost:8081`)  |
| `EVOLUTION_API_KEY`     | API key defined in `evolution.env`                |
| `EVOLUTION_INSTANCE`    | Instance name created in the manager              |
| `WHATSAPP_GROUP_ID`     | Target group ID (format: `120363XXXXXXXXXX@g.us`) |
| `FITNESS_BACKEND_URL`   | Fitness backend base URL                          |
| `FITNESS_BACKEND_TOKEN` | JWT token to authenticate against the backend     |

### 6. Run the bot

```bash
npm run start
```

## Getting the WhatsApp Group ID

Once your instance is connected, call:

```
GET http://localhost:8081/group/fetchAllGroups/fitness-bot?getParticipants=false
```

With header `apikey: your_api_key`. Find your group in the response and copy the `id` field.

## Daily message example

```
📊 Resumen de entrenamiento
📅 viernes 14 de marzo

Detalle por persona:
✅ matias@gmail.com - Fuerza, Cardio (40-60 min)
⚡ juan@gmail.com - Movilidad (20-40 min)
❌ pedro@gmail.com

Resumen del día:
✅ Completaron: 2
⚡ Parcial: 1
❌ No entrenaron: 1

🏋️ Entrenamientos:
  • Fuerza: 1
  • Cardio: 1
  • Movilidad: 1

🔥 Asistencia: 50%
¡Sigan así! 💪
```

## Related projects

- [fitness-backend](https://github.com/matiasncatala/fitness-backend) — REST API that stores workout logs
