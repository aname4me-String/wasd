# wasd – Couchbase Document Store Task

## Fixed folder structure

Root contains only:
- `./.gitignore`
- `./README.md`
- folders (`backend`, `frontend`, `docker`, `docs`)

Each folder has its own `.gitignore`.

## Projects

- `backend/`: Spring Boot (Gradle Wrapper) + Couchbase CRUD API
- `frontend/`: Angular CRUD prototype
- `docker/`: Docker Compose + Dockerfiles + `example.env`
- `docs/`: task documentation

## Quick start

1. Copy env example:
   - `cp ./docker/example.env ./docker/.env`
2. Start stack:
   - `cd ./docker && docker compose up --build`
3. Open:
   - Frontend: `http://localhost`
   - Backend health: `http://localhost:8080/actuator/health`
   - Couchbase UI: `http://localhost:8091`

## CRUD endpoints

- `GET /api/notes`
- `POST /api/notes`
- `PUT /api/notes/{id}`
- `DELETE /api/notes/{id}`

Detailed documentation:
- `./docs/couchbase-task.md`
