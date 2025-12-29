# Stage 1: Build Frontend
FROM node:20-alpine as frontend-builder

WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ .
RUN npm run build

# Stage 2: Backend Runtime
FROM python:3.12-slim-bookworm

# Install uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /bin/uv

WORKDIR /app

# Copy backend dependencies
COPY backend/pyproject.toml backend/uv.lock ./

# Sync dependencies
RUN uv sync --frozen --no-install-project

# Copy backend source
COPY backend/ .

# Copy frontend build artifacts to a static directory
COPY --from=frontend-builder /app/frontend/dist /app/static

# Sync project
RUN uv sync --frozen

# Expose port
EXPOSE 8000

# Run the application
CMD ["uv", "run", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
