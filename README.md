# Jinyverse Monorepo

pnpm, Next.js, Spring Boot, Postgres를 사용하는 모노레포 프로젝트입니다.

## 프로젝트 구조

- `backend/`: Spring Boot (Java 17, JPA, PostgreSQL)
- `frontend/external`: 외부 사용자용 Next.js 앱
- `frontend/internal`: 내부 관리자용 Next.js 앱
- `frontend/common`: 공통 라이브러리

## 개발 시작하기

### 필수 조건

- Docker & Docker Compose
- pnpm
- Java 17

### 실행 방법

```bash
# 전체 스택 실행 (Postgres, Backend, Frontend)
docker-compose up --build
```

### 개별 실행

#### Backend

```bash
cd backend
./gradlew bootRun
```

#### Frontend

```bash
# External (포트 3000)
cd frontend/external
pnpm dev

# Internal (포트 3001)
cd frontend/internal
pnpm dev
```
