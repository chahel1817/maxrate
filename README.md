# ⚡ MaxRate

### Next-Gen API Rate Limiting & Traffic Analytics Platform

MaxRate is a full-stack SaaS platform that empowers developers to protect their APIs with intelligent rate limiting, real-time traffic analytics, and secure key management — all through a sleek, modern dashboard.

🔗 **Live Demo:** [maxrate.vercel.app](https://maxrate.vercel.app)

---

## ✨ Key Features

| Feature | Description |
|---------|-------------|
| 🔐 **JWT Authentication** | Secure login/register with BCrypt hashing and stateless JWT tokens |
| 🚦 **Smart Rate Limiting** | Configure per-user request thresholds with customizable time windows |
| 📊 **Real-time Analytics** | Live traffic overview with dynamic charts and 5-second polling |
| 📡 **Activity Stream** | Monitor every incoming API request with sub-second latency |
| 🔑 **API Key Management** | Generate, revoke, and copy API keys with one-click actions |
| 🛡️ **Request Filtering** | Servlet filter validates API keys and enforces rate limits on `/api/**` routes |
| ⚡ **Redis Caching** | High-performance rate limit tracking with Redis |
| 🎨 **Premium UI** | Glassmorphism-inspired design with Framer Motion animations |

---

## 🛠️ Tech Stack

### Backend
| Technology | Purpose |
|------------|---------|
| **Spring Boot 4** | REST API framework |
| **Spring Security** | Authentication & authorization |
| **JWT (jjwt)** | Stateless token-based auth |
| **Spring Data JPA / Hibernate** | ORM & data access |
| **Spring Data Redis** | Rate limit counter caching |
| **H2 / MySQL / PostgreSQL** | Multi-database support |
| **Maven** | Build & dependency management |
| **Docker** | Containerized deployment |

### Frontend
| Technology | Purpose |
|------------|---------|
| **Next.js 16** | React framework with SSR |
| **React 19** | UI component library |
| **Tailwind CSS 4** | Utility-first styling |
| **Framer Motion** | Animations & transitions |
| **Lucide React** | Icon system |
| **TypeScript** | Type safety |

### DevOps & Infrastructure
| Technology | Purpose |
|------------|---------|
| **Jenkins** | CI/CD pipeline (build → test → deploy) |
| **AWS EC2** | Production server hosting |
| **Docker** | Container builds for Render/Railway |
| **Render** | Free-tier backend hosting |
| **Aiven** | Managed MySQL database |
| **Vercel** | Frontend hosting & CDN |

---

## 🏗️ Architecture

```
┌─────────────────┐     HTTPS      ┌─────────────────────┐     JDBC      ┌──────────┐
│   Next.js 16    │ ──────────────▶ │  Spring Boot 4 API  │ ────────────▶ │ Database │
│   (Vercel)      │ ◀────────────── │  (Render / EC2)     │ ◀──────────── │ (MySQL / │
│                 │     JSON        │                     │               │  H2/PG)  │
└─────────────────┘                 │  ┌───────────────┐  │               └──────────┘
                                    │  │ JWT Auth       │  │
                                    │  │ Rate Limiter   │  │     ┌───────────┐
                                    │  │ CORS Filter    │  │ ───▶│   Redis   │
                                    │  └───────────────┘  │     └───────────┘
                                    └─────────────────────┘
```

---

## 📦 Project Structure

```
maxrate/
├── src/main/java/com/project/api_limiting/
│   ├── config/              # Security & CORS configuration
│   ├── controller/          # REST endpoints
│   │   ├── AuthController       # Login, Register, Email check
│   │   ├── AnalyticsController  # Dashboard stats & traffic data
│   │   ├── RateLimitController  # CRUD for rate limit rules
│   │   ├── UserController       # API key management
│   │   ├── ApiTestController    # Test endpoint for rate limiting
│   │   └── HomeController       # Health check
│   ├── dto/                 # Request/Response DTOs
│   ├── entity/              # JPA Entities
│   │   ├── User                 # User account with API key
│   │   ├── RateLimitRule        # Per-user rate limit config
│   │   └── RequestLog           # API request audit trail
│   ├── exception/           # Global error handling
│   ├── filter/              # Rate limit servlet filter
│   ├── security/            # JWT utilities & auth filter
│   ├── repository/          # Spring Data JPA repositories
│   └── service/             # Business logic layer
├── frontend/
│   ├── app/                 # Next.js pages
│   │   ├── login/               # Auth page (login + register)
│   │   ├── dashboard/           # Analytics dashboard
│   │   ├── api-keys/            # Key management
│   │   ├── rate-limits/         # Rule configuration
│   │   └── logs/                # Request log viewer
│   ├── components/          # Reusable UI (Sidebar)
│   └── lib/                 # API client & utilities
├── Dockerfile               # Multi-stage Docker build
├── Jenkinsfile              # CI/CD pipeline definition
└── pom.xml                  # Maven configuration
```

---

## 🚀 Getting Started

### Prerequisites

- **Java 17+**
- **Node.js 18+**
- **Maven** (or use the included `mvnw` wrapper)

### 1. Clone the Repository

```bash
git clone https://github.com/chahel1817/maxrate.git
cd maxrate
```

### 2. Run the Backend

By default, MaxRate uses an embedded **H2 database** — no external DB setup needed.

```bash
# Start the Spring Boot server on http://localhost:8080
./mvnw spring-boot:run
```

> **Using MySQL instead?** Create an `application.properties` override:
> ```properties
> JDBC_URL=jdbc:mysql://localhost:3306/maxrate_db
> DB_USER=root
> DB_PASS=yourpassword
> ```

### 3. Run the Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend runs at `http://localhost:3000` and connects to the backend at `http://localhost:8080`.

### 4. Test It

1. Open `http://localhost:3000`
2. **Register** a new account
3. Explore the **Dashboard**, **API Keys**, **Rate Limits**, and **Logs** pages

---

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/auth/register` | Register a new user |
| `POST` | `/auth/login` | Login and receive JWT token |
| `GET` | `/auth/check-email?email=` | Check if email exists |

### Dashboard & Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/analytics/summary` | Dashboard summary stats |

### Rate Limit Rules
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/rate-limit` | List all rate limit rules |
| `POST` | `/rate-limit?userId=` | Create a new rule |
| `PUT` | `/rate-limit/{id}` | Update a rule |
| `DELETE` | `/rate-limit/{id}` | Delete a rule |

### API Keys
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/user/api-key?userId=` | Get user's API key |
| `POST` | `/user/regenerate-key?userId=` | Regenerate API key |

### Request Logs
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/logs` | Fetch all request logs |

### Test Endpoint (Rate Limited)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/test` | Test endpoint protected by rate limiter |

> **Note:** `/api/**` endpoints require an `x-api-key` header and are subject to rate limiting.

---

## 🌐 Deployment

MaxRate is deployed on a **100% free** stack:

| Component | Platform | Cost |
|-----------|----------|------|
| **Backend** | [Render](https://render.com) | Free |
| **Database** | [Aiven](https://aiven.io) (MySQL) | Free |
| **Frontend** | [Vercel](https://vercel.com) | Free |

### Environment Variables

**Backend (Render / EC2):**

| Variable | Description |
|----------|-------------|
| `JDBC_URL` | JDBC connection string (e.g., `jdbc:mysql://host:port/db?sslMode=REQUIRED`) |
| `DB_USER` | Database username |
| `DB_PASS` | Database password |
| `PORT` | Server port (default: `8080`) |
| `CORS_ALLOWED_ORIGINS` | Comma-separated allowed origins (e.g., `https://maxrate.vercel.app,http://localhost:3000`) |

**Frontend (Vercel):**

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Backend URL (e.g., `https://maxrate-6hij.onrender.com`) — **no trailing slash** |

---

## 🔄 CI/CD Pipeline

MaxRate includes a **Jenkinsfile** for automated build, test, and deployment to AWS EC2:

```
Checkout → Build & Test → Archive JAR → Deploy to EC2
```

The pipeline:
1. Builds the Spring Boot JAR with Maven
2. Archives the artifact
3. Transfers the JAR and systemd service file to EC2 via SCP
4. Restarts the service and validates it's running

---

## 🧪 Testing the Rate Limiter

```bash
# 1. Register and get your API key from the dashboard

# 2. Make requests to the test endpoint
curl -H "x-api-key: ak-your-api-key-here" https://your-backend-url/api/test

# 3. Exceed your rate limit to see throttling in action
for i in {1..20}; do
  curl -s -o /dev/null -w "%{http_code}\n" \
    -H "x-api-key: ak-your-api-key-here" \
    https://your-backend-url/api/test
done
# You'll see 200s turn into 429s once the limit is hit
```

---

## 📸 Screenshots

| Dashboard | Rate Limits | API Keys | Logs |
|-----------|-------------|----------|------|
| Real-time traffic analytics with live charts | Configure per-user rate limiting rules | Generate and manage API keys | Search and filter request history |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<p align="center">
  Built with ❤️ by <a href="https://github.com/chahel1817">chahel1817</a>
</p>
