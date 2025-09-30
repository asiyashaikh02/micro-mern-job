# micro-mern-job (monolith → microservices)
This repo contains a complete example to split a Node/Express/Mongoose monolith into:

- `job-service` — owns JobDescription (MongoDB `jobs_db`)
- `applicant-service` — owns Applicant (MongoDB `applicants_db`), calls job-service for JD details
- `nginx` — NGINX reverse proxy gateway (routes `/api/jds` and `/api/applicants`)
- `rabbitmq` — message broker for event-driven snippets (optional)
- `migration` — script to migrate data from an existing monolith DB into new DBs
- `docker-compose.yml` — brings everything up locally (Mongo, RabbitMQ, services, nginx)

## What I included
- Fully scaffolded services with models/controllers/routes/main.js
- Dockerfiles for each Node service
- `docker-compose.yml` to run locally
- Example RabbitMQ publisher (job-service) and subscriber (applicant-service) to keep a cached JD snapshot
- Migration script to move data from the old monolith DB
- `nginx` config used as API gateway

## How to run (local dev)
1. Ensure Docker and Docker Compose are installed.
2. From this project root:
   ```bash
   docker compose up --build
   ```
3. API Gateway (NGINX) will listen on port 8080:
   - Job endpoints: `http://localhost:8080/api/jds`
   - Applicant endpoints: `http://localhost:8080/api/applicants`

## Notes
- For simplicity both services use a single Mongo instance but different DB names.
- The event system is illustrative: job-service publishes `job.updated` events to RabbitMQ; applicant-service subscribes and stores a `jobSnapshot` in applicants (optional caching strategy).
- Update env vars in `docker-compose.yml` before deploying to production (secrets, credentials, separate DB instances, TLS).
