# =========================================================
# AGRIVISION V3 - FULL STACK DOCKERFILE
# React + Vite Frontend + FastAPI Backend
# =========================================================


# =========================================================
# STAGE 1 - BUILD REACT FRONTEND
# =========================================================

FROM node:24-alpine AS frontend-builder

WORKDIR /app/frontend

# Copy frontend package files
COPY frontend/package*.json ./

# Install dependencies
RUN npm install

# Copy frontend source code
COPY frontend/ ./

# Build production frontend
RUN npm run build


# =========================================================
# STAGE 2 - FASTAPI BACKEND
# =========================================================

FROM python:3.12-slim

WORKDIR /app

# Prevent Python from creating .pyc files
ENV PYTHONDONTWRITEBYTECODE=1

# Show Python output immediately in Render logs
ENV PYTHONUNBUFFERED=1


# =========================================================
# INSTALL BACKEND DEPENDENCIES
# =========================================================

COPY backend/requirements.txt /app/backend/requirements.txt

RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r /app/backend/requirements.txt


# =========================================================
# COPY BACKEND
# =========================================================

COPY backend/ /app/backend/


# =========================================================
# COPY BUILT REACT APP
# =========================================================

COPY --from=frontend-builder /app/frontend/dist /app/frontend_dist


# Tell FastAPI where React production files are
ENV FRONTEND_DIST=/app/frontend_dist


# =========================================================
# BACKEND WORKING DIRECTORY
# =========================================================

WORKDIR /app/backend


# =========================================================
# START AGRIVISION
# =========================================================

CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-10000}"]