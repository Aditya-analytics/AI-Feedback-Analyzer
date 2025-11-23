# Multi-stage build: build React frontend, then run Node backend serving static files

# ---------- Frontend build ----------
FROM node:18-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci --legacy-peer-deps
COPY frontend/ .
RUN npm run build

# ---------- Backend runtime ----------
FROM node:18-alpine AS backend
WORKDIR /app

# Install backend deps
COPY backend/package.json backend/package-lock.json ./backend/
RUN cd backend && npm ci --only=production --legacy-peer-deps

# Copy backend source
COPY backend/ ./backend/

# Copy frontend build into backend to be served by Express
COPY --from=frontend-build /app/frontend/build ./frontend/build

ENV NODE_ENV=production
# PORT will be set by Render automatically
WORKDIR /app/backend
EXPOSE 10000

# Use PORT from environment (Render sets this)
CMD ["node", "server.js"]



