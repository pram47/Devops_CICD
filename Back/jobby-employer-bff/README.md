# Jobby Employer BFF

Backend for Frontend (BFF) for Jobby Employer — NestJS + Bun + TypeScript.

## Stack

- **Runtime:** [Bun](https://bun.sh)
- **Framework:** [NestJS](https://nestjs.com)
- **Language:** TypeScript
- **API docs:** Swagger (OpenAPI)
- **Formatting:** Prettier

## Setup

```bash
cd jobby-employer-bff
bun install
```

If `bun install` fails (e.g. with some packages), use `npm install` instead; you can still run the app with `bun run start:dev` or `npm run start:dev`.

## Scripts


| Command                | Description                |
| ---------------------- | -------------------------- |
| `bun run start`        | Start app                  |
| `bun run start:dev`    | Start with watch (dev)     |
| `bun run start:prod`   | Run built app (production) |
| `bun run build`        | Build for production       |
| `bun run format`       | Format with Prettier       |
| `bun run format:check` | Check formatting           |


## Swagger

After starting the app:

- **Swagger UI:** [http://localhost:4444/api](http://localhost:4444/api)
- **API:** [http://localhost:4444](http://localhost:4444)

## Docker

Build:

```bash
docker build -t jobby-employer-bff .
```

Run:

```bash
docker run -p 4444:4444 jobby-employer-bff
```

Port is configurable via `PORT` (default `4444`):

```bash
docker run -p 8080:8080 -e PORT=8080 jobby-employer-bff
```

## Environment


| Variable | Description | Default |
| -------- | ----------- | ------- |
| `PORT`   | Server port | `4444`  |


Optional: `.env` or `.env.local` in the project root.