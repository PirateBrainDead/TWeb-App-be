
---

# TASK MANAGEMENT API

## Installation

```bash
$ npm install
```

---

## Project Setup - Local

```bash
$ cp .env.example .env
$ docker compose up -d
$ npm run start:dev
```

**Note:** _Ensure Redis is running before starting the application._

### Redis

Instructions for installing Redis locally can be found [here](https://redis.io/docs/getting-started/installation/).

**Note:** _Redis isn't officially supported on Windows. For development, you can use a container (see [docker-compose.yml](docker-compose.yml))._

---

## Seed Database

```bash
# Local
$ npm run fixtures-local
```

```bash
# Server
$ npm run fixtures-server
```

---

## Tests

```bash
# Run unit tests
$ npm run test

# Generate test coverage
$ npm run test:cov
```

---

## Documentation

API documentation (Swagger) is available [here](http://localhost:3000/api/).

---

## Folder Structure

### src

- **config**: Custom configuration files for managing related settings.
- **fixtures**: Initial seed data for stores and users.
- **modules**: Contains business logic organized by database entities.
  - **auth**: Authentication and Authorization logic using JWT.
  - **database entity modules**: e.g., Notices, Sections, Stores, etc.
  - **gateways**: Platform-agnostic gateways for WebSocket communication.
- **libs**: Third-party libraries like Redis and CLS (Continuation-Local Storage).
- **schedules**: CRON jobs for periodic tasks like creating daily statistics.
- **shared**: Shared components like constants, decorators, filters, guards, repository, and utilities.

---

## Environment Variables

All variables for `TEST`, `STAGE`, and `PRODUCTION` environments are stored in GitLab CI/CD Variables. Values are dynamically changed during deployment.

```dotenv
NODE_ENV=
PORT=

REDIS_HOST=
REDIS_PORT=

JWT_SECRET=
```

---