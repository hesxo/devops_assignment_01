# DevOps Assignment 01 — API Server

Node.js API server that connects to PostgreSQL and reads/writes a persistent data file.

## API Endpoints

| Method | Path        | Description                          |
|--------|-------------|--------------------------------------|
| GET    | `/db-data`  | Retrieve data from the database      |
| POST   | `/file-data`| Write JSON body `{ "data": "..." }` to file |
| GET    | `/file-data`| Read and return file contents        |
| GET    | `/health`   | Health check                         |

## Environment Variables

| Variable      | Description              |
|---------------|--------------------------|
| `DB_HOST`     | PostgreSQL host          |
| `DB_PORT`     | PostgreSQL port          |
| `DB_NAME`     | Database name            |
| `DB_USER`     | Database user            |
| `DB_PASSWORD` | Database password        |
| `PORT`        | Server port (default: 3000) |
| `DATA_DIR`    | Directory for data file (default: `./data`) |

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

## Local Development

```bash
npm install
npm start
```

## Docker

### Build the image

```bash
docker build -t devops-assignment-api .
```

### Run with docker run

Mount a volume so the data file persists across container restarts:

```bash
docker run -d \
  --name devops-assignment-api \
  -p 3000:3000 \
  -e DB_HOST="" \
  -e DB_PORT="30432" \
  -e DB_NAME="" \
  -e DB_USER="devops_sandbox" \
  -e DB_PASSWORD="" \
  -e DATA_DIR="/app/data" \
  -v "$(pwd)/data:/app/data" \
  devops-assignment-api
```

### Run with Docker Compose

```bash
docker compose up --build -d
```

Stop:

```bash
docker compose down
```

The `./data` directory is mounted into the container, so `file-data.txt` survives restarts.

## Example Requests

```bash
# Database data
curl http://localhost:3000/db-data

# Write to file
curl -X POST http://localhost:3000/file-data \
  -H "Content-Type: application/json" \
  -d '{"data":"Hello from API"}'

# Read from file
curl http://localhost:3000/file-data
```
