# Production Multi-Stage Dockerfile for Telangana Realty Backend
FROM node:22-alpine AS builder

WORKDIR /app

# Copy dependency specifications
COPY package*.json tsconfig.json ./
RUN npm ci

# Copy source code and build
COPY src/ ./src/
COPY tests/ ./tests/
RUN npm run build

# Production runner stage
FROM node:22-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=5000

# Install production dependencies only
COPY package*.json ./
RUN npm ci --omit=dev

# Copy compiled artifacts from builder stage
COPY --from=builder /app/dist ./dist
COPY src/db/schema/schema.sql ./src/db/schema/schema.sql

# Create persistent uploads directory
RUN mkdir -p /app/uploads && chown -R node:node /app

USER node

EXPOSE 5000

CMD ["node", "dist/backend/src/server.js"]
