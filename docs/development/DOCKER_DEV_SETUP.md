# Docker Development Setup

This guide shows how to run the entire Eventix stack (frontend, API, background workers, Postgres, and Redis) with Docker for local development.

## Prerequisites
- Docker Desktop 4.22+ with the `docker compose` CLI
- At least 8 GB RAM available for containers
- (Optional) Azure Service Bus namespace if you want to test against the cloud queue instead of the local Redis-backed queue

> **Note**: By default the development stack uses Redis as the message queue. If you want to exercise the Azure Service Bus integration locally, switch `QUEUE_MODE` to `servicebus` and supply the connection string as described below.

## 1. Configure environment variables

Create a file named `.env.docker` in the repository root (same folder as `docker-compose.dev.yml`) to hold optional secrets:

```dotenv
# Optional: switch to Azure Service Bus instead of Redis
# QUEUE_MODE=servicebus
# SERVICE_BUS_CONNECTION_STRING=Endpoint=sb://<your-namespace>.servicebus.windows.net/;SharedAccessKeyName=<key-name>;SharedAccessKey=<key-value>
# SERVICE_BUS_FINALIZATION_QUEUE=order-queue

# Optional telemetry
APPLICATION_INSIGHTS_CONNECTION_STRING=
```

This file is only used by Docker Compose and is not committed to source control. If you skip creating it, remove the `--env-file .env.docker` flag from the commands below.

## 2. Build dependencies & database schema (first run only)

Start the data stores:

```cmd
docker compose --env-file .env.docker -f docker-compose.dev.yml up -d postgres redis
```

Apply Prisma migrations to create the schema:

```cmd
docker compose --env-file .env.docker -f docker-compose.dev.yml run --rm frontend npx prisma migrate dev --name init
```

The command installs dependencies inside the temporary container and runs migrations against the Postgres service defined in the Compose file. When it finishes, the container is removed automatically.

## 3. Start the full stack

Bring up every service with hot reload enabled:

```cmd
docker compose --env-file .env.docker -f docker-compose.dev.yml up --build
```

Services exposed to the host:

| Service   | URL                     | Description |
|-----------|------------------------|-------------|
| Frontend  | http://localhost:5173  | Vite dev server with HMR |
| API       | http://localhost:8080  | Fastify API (TypeScript + tsx watch) |
| Postgres  | localhost:5432         | Development database |
| Redis     | localhost:6379         | Caching + hold storage |

Logs from every service stream to the terminal. Hot reloading is enabled by volume mounts; any change you make to the repository is immediately picked up by the running containers.

## 4. Stop services

Use `Ctrl+C` to stop the stack, then optionally remove containers and named volumes:

```cmd
docker compose --env-file .env.docker -f docker-compose.dev.yml down
```

Add `-v` if you also want to clear the Postgres/Redis volumes.

## Troubleshooting

- **File changes are not detected**: The Compose file sets `CHOKIDAR_USEPOLLING=1` for all watch processes. If you still do not see reloads, ensure Docker Desktop is running with file sharing enabled for the project drive.
- **Switch to Azure Service Bus**: Set `QUEUE_MODE=servicebus` and provide `SERVICE_BUS_CONNECTION_STRING` / `SERVICE_BUS_FINALIZATION_QUEUE` (for example in `.env.docker`). Restart the stack so both the API and finalizer pick up the new configuration.
- **Prisma migration errors**: Verify `DATABASE_URL` inside the `frontend` service points to Postgres (`postgresql://eventix:eventix@postgres:5432/eventix?sslmode=disable`). You can rerun migrations after fixing connection issues.
- **Port conflicts**: Change the published ports in `docker-compose.dev.yml` if 5173 or 8080 are already in use on your machine.

You now have a reproducible Docker-based development environment for Eventix.
