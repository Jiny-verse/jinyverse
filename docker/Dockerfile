# --- Node.js Base Stage ---
FROM node:20-alpine AS base-node
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /app

# --- Java Base Stage ---
FROM eclipse-temurin:17-jdk-jammy AS base-java
WORKDIR /app

# --- Database Stage ---
FROM postgres:15-alpine AS database
# 환경 변수는 docker-compose.yml에서 주입됩니다

# --- Backend Stage ---
FROM base-java AS backend
COPY backend .
RUN ./gradlew :api:build -x test
FROM eclipse-temurin:17-jre-jammy AS backend-runner
RUN apt-get update && apt-get install -y --no-install-recommends imagemagick \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY --from=backend /app/api/build/libs/*.jar app.jar
# Non-root user for security
RUN groupadd -r jiny && useradd -r -g jiny jiny
RUN mkdir -p /app/data/uploads && chown -R jiny:jiny /app/data/uploads
RUN chown jiny:jiny app.jar
USER jiny
ENTRYPOINT ["java", "-jar", "app.jar"]

# --- Frontend External Stage ---
FROM base-node AS external
COPY . .
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
RUN pnpm install --no-frozen-lockfile
RUN pnpm --filter @jinyverse/external build
RUN pnpm --filter @jinyverse/external deploy --prod /app/deploy/external

FROM node:20-alpine AS external-runner
WORKDIR /app
COPY --from=external /app/deploy/external/node_modules ./node_modules
COPY --from=external /app/frontend/external/.next .next
COPY --from=external /app/frontend/external/package.json .
EXPOSE 3001
USER node
CMD ["node_modules/.bin/next", "start", "-p", "3001"]

# --- Frontend Internal Stage ---
FROM base-node AS internal
COPY . .
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
RUN pnpm install --no-frozen-lockfile
RUN pnpm --filter @jinyverse/internal build
RUN pnpm --filter @jinyverse/internal deploy --prod /app/deploy/internal

FROM node:20-alpine AS internal-runner
WORKDIR /app
COPY --from=internal /app/deploy/internal/node_modules ./node_modules
COPY --from=internal /app/frontend/internal/.next .next
COPY --from=internal /app/frontend/internal/package.json .
EXPOSE 3000
USER node
CMD ["node_modules/.bin/next", "start", "-p", "3000"]
