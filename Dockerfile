# Stage 1: Build Frontend
FROM node:22-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: Build Backend and Final Image
FROM python:3.12-slim
WORKDIR /app/backend
RUN pip install uv
COPY backend/pyproject.toml backend/uv.lock ./
RUN uv sync
COPY backend/ ./

# Copy built frontend
COPY --from=frontend-builder /app/frontend/dist /app/frontend/dist

EXPOSE 8000
CMD ["uv", "run", "python", "run.py"]
