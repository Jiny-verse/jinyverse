# Jinyverse Monorepo

pnpm · Next.js 15 · Spring Boot 3.3 · PostgreSQL 15 · Docker 기반 풀스택 모노레포

| 기술        | 버전            |
| ----------- | --------------- |
| Java        | 17              |
| Spring Boot | 3.3             |
| Next.js     | 15 (App Router) |
| PostgreSQL  | 15              |
| pnpm        | 9+              |
| Docker      | 24+             |

---

## 서비스 포트 및 접근 권한

보안 강화를 위한 외부 직접 노출 포트 최소화 및 관리용 서비스 로컬 바인딩(SSH 터널링 필수) 설정 상태

| 서비스 | 접근 주소 (Port) | 내부 포트 | 설명 |
| :--- | :--- | :--- | :--- |
| **Nginx (Proxy)** | `80`, `443` | - | 전체 서비스의 진입점 (SSL 적용) |
| **Frontend (User)** | `jinyverse.com` | `3001` | Nginx를 통한 서비스 제공 |
| **Frontend (Admin)** | `admin.jinyverse.com` | `3000` | Nginx를 통한 서비스 제공 |
| **Backend API** | `api.jinyverse.com` | `8080` | Nginx를 통한 서비스 제공 |
| **PostgreSQL** | `127.0.0.1:5433` | `5432` | 외부 접속 차단 (SSH 터널링 필요) |
| **Jenkins** | `127.0.0.1:8081` | `8080` | 외부 접속 차단 (SSH 터널링 필요) |

---

## 시작하기 (Quick Start)

### 1. 필수 조건

- **[Docker Desktop v24+](https://docs.docker.com/get-docker/)** — 전체 스택 실행에 필요
- **[pnpm](https://pnpm.io/installation)** (Node.js 20+) — 프론트엔드 의존성 관리
  ```bash
  npm i -g pnpm
  ```
- **Java 17 JDK** — 로컬 `bootRun` 시에만 필요 (Docker 실행이면 불필요)

### 2. 저장소 클론

```bash
git clone <repo-url>
cd jinyverse
```

### 3. 환경변수 설정

```bash
# 로컬 개발용 (기본값이 설정되어 있어 수정 없이 바로 사용 가능)
cp .env.local.example .env

# 운영 서버용 (실제 값으로 반드시 수정)
cp .env.example .env
```

#### 환경변수 설명

| 변수                         | 설명                      | 로컬 기본값                                  | 프로덕션                  |
| ---------------------------- | ------------------------- | -------------------------------------------- | ------------------------- |
| `POSTGRES_DB`                | DB 이름                   | `jinyverse`                                  | `jinyverse`               |
| `POSTGRES_USER`              | DB 사용자                 | `postgres`                                   | `postgres`                |
| `POSTGRES_PASSWORD`          | DB 비밀번호               | `postgres`                                   | **변경 필수**             |
| `POSTGRES_DATA_PATH`         | DB 데이터 저장 경로       | 비워둠 (named volume)                        | `/srv/data/postgres`      |
| `UPLOAD_DATA_PATH`           | 업로드 파일 저장 경로     | 비워둠 (named volume)                        | `/srv/data/uploads`       |
| `NEXT_PUBLIC_API_URL`        | 프론트 → 백엔드 API URL   | `http://localhost:8080`                      | `https://api.jinyverse.com` |
| `SPRING_DATASOURCE_URL`      | JDBC 접속 URL (bootRun용) | `jdbc:postgresql://localhost:5433/jinyverse` | 불필요 (Docker 내부 연결) |
| `SPRING_DATASOURCE_USERNAME` | DB 사용자                 | `postgres`                                   | `postgres`                |
| `SPRING_DATASOURCE_PASSWORD` | DB 비밀번호               | `postgres`                                   | **변경 필수**             |
| `JWT_SECRET`                 | JWT 서명 키 (32자 이상)   | `local_dev_secret...`                        | **변경 필수**             |
| `MAIL_USE_SMTP`              | 이메일 발송 활성화        | `false`                                      | `true`                    |
| `MAIL_USERNAME`              | Gmail 주소                | 비워둠                                       | `your@gmail.com`          |
| `MAIL_PASSWORD`              | Google 앱 비밀번호        | 비워둠                                       | 앱 비밀번호               |

### 4. Docker로 실행하기

**[로컬 개발 - Local]**

`docker-compose.local.yml`이 named volume과 기본 API URL을 자동으로 설정합니다.

```bash
docker compose -f docker-compose.yml -f docker-compose.local.yml up -d --build
```

**[운영 배포 - Production]**

`.env`의 `NEXT_PUBLIC_API_URL`, 비밀번호 등을 먼저 수정한 뒤 실행합니다 (`cp .env.example .env`).

```bash
docker compose up -d --build
```

**[Jenkins CI/CD 서버]**

```bash
# 1. Jenkins 컨테이너 기동
docker compose -f docker-compose.jenkins.yml up -d --build

# 2. 초기 관리자 비밀번호 확인
docker exec jinyverse-jenkins cat /var/jenkins_home/secrets/initialAdminPassword

# 3. http://localhost:8081 접속 (SSH 터널링 사용 권장)
#    - 보안을 위해 Jenkins는 서버 로컬(127.0.0.1)에만 바인딩됨
#    - 로컬 PC에서 접속 시: ssh -L 8081:localhost:8081 user@server_ip
#    - 이후 웹 브라우저에서 http://localhost:8081 접속
#    - 초기 설정 마법사 진행

# 4. 파이프라인 잡 생성
#    새 아이템 → Pipeline 이름 입력 → Pipeline 선택 → 확인
#    → Pipeline > Definition: "Pipeline script from SCM"
#    → SCM: Git, Repository URL: <repo-url>
#    → Script Path: Jenkinsfile
```

### 5. 실행 확인 (Health Check)

기동 후 아래 URL에서 각 서비스가 응답하는지 확인합니다.

| 서비스            | URL                                   |
| ----------------- | ------------------------------------- |
| Backend API       | http://localhost:8080/actuator/health |
| External (사용자) | http://localhost:3001                 |
| Internal (관리자) | http://localhost:3000                 |
| Jenkins           | http://localhost:8081                 |

컨테이너 상태 및 로그 확인:

```bash
docker compose ps
docker compose logs -f backend   # 특정 서비스 로그
```

### 6. 중지 / 정리

```bash
# 로컬 환경 중지
docker compose -f docker-compose.yml -f docker-compose.local.yml down

# 볼륨까지 삭제 (DB 초기화)
docker compose -f docker-compose.yml -f docker-compose.local.yml down -v
```

---

## 개별 개발 환경 (Docker 없이 실행)

### 의존성 설치

```bash
# 프론트엔드 패키지 설치 (루트에서 한 번만)
pnpm install
```

### Backend (Spring Boot)

DB는 Docker로 먼저 실행해야 합니다. `.env`의 `SPRING_DATASOURCE_URL`이 `localhost:5433`을 가리키는지 확인합니다.

```bash
# postgres만 Docker로 실행
docker compose -f docker-compose.yml -f docker-compose.local.yml up -d postgres

# 백엔드 직접 실행
cd backend
./gradlew bootRun
```

테스트 실행:

```bash
cd backend
./gradlew :api:test                                                 # 전체 테스트
./gradlew :api:test --tests "com.jinyverse.backend.SomeTest"       # 단일 테스트
```

### Frontend (Next.js 개발 서버)

```bash
# 루트에서 실행
pnpm external dev   # http://localhost:3001
pnpm internal dev   # http://localhost:3000

# 각 디렉토리에서 실행
cd frontend/external && pnpm dev
cd frontend/internal && pnpm dev
```

### 코드 품질

```bash
pnpm format          # 전체 포맷 (Prettier)
pnpm format:check    # 포맷 검사만
pnpm external lint   # External ESLint
pnpm internal lint   # Internal ESLint
```

---

## 데이터베이스

- PostgreSQL 15, 스키마는 `sql/migration/`의 날짜별 SQL 파일로 관리
- 컨테이너 최초 기동 시 `sql/` 디렉토리가 자동으로 초기화됨
- JPA `ddl-auto: validate` 사용 — 스키마 변경은 반드시 SQL 파일로 추가

```bash
# DB 접속 (로컬)
docker exec -it <postgres_container_name> psql -U postgres -d jinyverse
# 또는 DBeaver 등 GUI 툴: localhost:5433 / postgres / postgres
```

스키마 전체 참조: `sql/dbdiagram/schema.dbml`

---

## 프로젝트 구조

```
jinyverse/
├── backend/                  # Spring Boot REST API (Java 17)
│   └── api/src/              #   com.jinyverse.backend 도메인별 패키지
├── frontend/
│   ├── common/               # 공유 라이브러리 (@jinyverse/common)
│   │   └── src/              #   components, hooks, schemas, services, types
│   ├── external/             # 사용자용 앱 (port 3001)
│   └── internal/             # 관리자용 앱 (port 3000)
├── sql/
│   ├── migration/            # 날짜별 스키마 마이그레이션 SQL
│   └── dbdiagram/schema.dbml # 전체 스키마 참조
├── docker/
│   ├── Dockerfile            # 멀티스테이지 빌드 (backend / external / internal)
│   └── Dockerfile.jenkins    # Jenkins LTS + Docker CLI
├── docker-compose.yml        # 프로덕션 기준 오케스트레이션
├── docker-compose.local.yml  # 로컬 개발 오버라이드 (named volume)
├── docker-compose.jenkins.yml# Jenkins 컨테이너 설정
├── Jenkinsfile               # CI/CD 파이프라인 (Checkout → Build → Deploy → Prune)
├── .env.local.example        # 로컬 환경변수 템플릿
├── .env.example              # 운영 환경변수 템플릿
└── README.md
```

---

## Security & Audit

공개 저장소 전환 전 자체 보안 감사를 통한 인프라 및 코드 전반의 보안 강화 조치 완료

- **Infrastructure Hardening**:
  - Jenkins `127.0.0.1` 바인딩을 통한 외부 직접 노출 차단 (SSH 터널링 필수)
  - Docker 컨테이너(Next.js, Spring Boot) Non-root 사용자 실행 적용
  - 데이터베이스 및 주요 서비스 기본 패스워드 제거 및 환경 변수 주입 강제
- **Nginx Security**:
  - HSTS, X-Frame-Options, CSP 등 표준 보안 헤더 기반 웹 취약점(XSS, Clickjacking 등) 방어
- **Code Integrity**:
  - `DOMPurify` 기반 데이터 렌더링 보안 및 `normalize()`를 활용한 Path Traversal 방어 로직 적용
  - 모든 시크릿 및 환경 변수는 `.env` 주입 방식 사용, 코드 내 하드코딩된 자격 증명 부재 보장

---
