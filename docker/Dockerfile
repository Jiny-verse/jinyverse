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
WORKDIR /app
COPY --from=backend /app/api/build/libs/*.jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]

# --- Frontend External Stage ---
FROM base-node AS external
COPY . .
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
RUN pnpm install --no-frozen-lockfile
RUN pnpm --filter @jinyverse/external build
FROM base-node AS external-runner
WORKDIR /app
COPY --from=external /app/frontend/external/next.config.ts ./
COPY --from=external /app/frontend/external/.next ./.next
COPY --from=external /app/node_modules ./node_modules
COPY --from=external /app/frontend/external/package.json ./package.json
EXPOSE 3001
CMD ["node_modules/.bin/next", "start", "-p", "3001"]

# --- Frontend Internal Stage ---
FROM base-node AS internal
COPY . .
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
RUN pnpm install --no-frozen-lockfile
RUN pnpm --filter @jinyverse/internal build
FROM base-node AS internal-runner
WORKDIR /app
COPY --from=internal /app/frontend/internal/next.config.ts ./
COPY --from=internal /app/frontend/internal/.next ./.next
COPY --from=internal /app/node_modules ./node_modules
COPY --from=internal /app/frontend/internal/package.json ./package.json
EXPOSE 3000
CMD ["node_modules/.bin/next", "start", "-p", "3000"]
