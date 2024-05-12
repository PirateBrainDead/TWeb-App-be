# TASK MANAGEMENT API

## Installation

```bash
$ yarn install
```

---

## Project setup - local

```bash
$ copy .env.example .env
$ docker compose up -d
$ yarn start:dev
```

Note: _Redis must be running before starting an application_

### Redis

Instructions how to install Redis locally can be found [here](https://redis.io/docs/getting-started/installation/).

Note: <em><u>Since Redis is not officially supported on Windows, the easiest way to set up Redis is to use container for development purpose (existing [docker-compose.yml](docker-compose.yml))</u></em>

---

## Seed DB

```bash
# Local
$ yarn fixtures-local
```

```bash
# Server
$ yarn fixtures-server
```

---

## Tests

```bash
# unit tests
$ yarn run test

# test coverage
$ yarn run test:cov
```

---

## Documentation

`API documentation - Swagger` is available at [here](http://localhost:3000/api/)

---

## Folder structure

### src

- _**config**_
  - Custom configuration files to return nested configuration objects. This allows you to group related configuration settings by function (e.g., database-related settings), and to store related settings in individual files to help manage them independently.
- _**fixtures**_
  - Initial seed data (stores and users)
- _**modules**_
  - Contains all business logic
  - Modules are separated by database entities, also there are libs modules (for third party libraries (redis, socket, etc..))
  - Every module consists of: `Controller`, `Services`, `Repository`, `Entity`, `Dtos`, `Unit Tests`, `Swagger`
  - **auth**
    - Logic for Authentication and Authorization with `JWT`
  - **database entity modules**
    - `Notices`, `Sections`, `Statistics`, `Stores`, `TaskTemplates`, `Tasks`, `Users`
  - **gateways**
    - Gateways are platform-agnostic which makes them compatible with any WebSockets library once an adapter is created
    - Task Management provides multiple gateways (notices, tasks, task-templates etc..), with different `namespace`
    - Logic behind every function in gateway is:
      1. Client will listen on event e.g. `daily|store:${storeId}` (dailyTasks)
      2. At the moment when change occurs on `dailyTasks` db collection, it will be immediately emitted with Event Emitter (library used: `@nestjs/event-emitter`) to corresponding gateway listener
      3. Then, `WebSocketServer` will emit message to all clients that are listening on the specific event (`dailyTasks`)
- **libs**
  - third-party libraries
  1. **Redis**
     - Used as a primary database
     - List of all collections can be found here: [db.utils.ts](src/shared/utils/db.utils.ts)
  2. **CLS**
     - A continuation-local storage module compatible with NestJS' dependency injection based on AsyncLocalStorage
     - The CLS context is a storage that wraps around a chain of function calls. It can be accessed anywhere during the lifecycle of such chain via the `ClsService`.
- _**schedules**_
  - Contains 3 CRON jobs (library used: `@nestjs/schedule`) - run every day on the Midnight:
    - Conversion of all repeatable tasks from all Stores to daily tasks
    - Creating daily statistics
    - Clearing Notices
- _**shared**_
  - **constants**
    - Read-only (date, errors, events, metadata, reg-exp)
  - **decorators**
    - Contains custom decorators (param, roles, validators)
  - **filters**
    - Custom global exception filter used for catching all exceptions and returning mentioned in the same JSON form
    - Every exception will be logged in the file per day with name: _**log/errors-YYYY-MM-DD.log**_
  - **guards**
    - Determine whether a given request will be handled by the route handler or not, depending on certain conditions (like permissions, roles)
  - **repository**
    - Generic Repository layer
  - **utils**
    - Contains various helper functions used multiple time across the whole app

---

## Publish Instructions

- Publish is done via Gitlab CI/CD deployment pipeline, can be found here: [.gitlab-ci.yml](.gitlab-ci.yml)
- There are multiple stages that needs to be passed before stage for deployment, all jobs are in folder: [cicd_jobs](cicd_jobs)

---

## .env

- All variables for `TEST`, `STAGE`, `PRODUCTION` environments are saved on `Gitlab` -> `CI/CD` -> `Variables`
- Values are dynamically changed during deployment - `CI/CD pipeline`

```
NODE_ENV=
PORT=

REDIS_HOST=
REDIS_PORT=

JWT_SECRET=
```
