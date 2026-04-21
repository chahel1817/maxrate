# ⚡ MaxRate

### Next-Gen API Rate Limiting & Traffic Analytics

MaxRate is a high-performance, developer-first SaaS platform designed to protect your APIs with intelligent rate-limiting strategies and real-time observability.

---

## 🚀 Key Features

- **Intelligent Rate Limiting** — Configure granular request thresholds per user or global defaults.
- **Real-time Analytics** — Dynamic traffic overview charts with live 5-second polling.
- **Live Activity Stream** — Monitor every incoming request with sub-second latency.
- **Key Management** — Secure API key generation, revocation, and clipboard integration.
- **Validation & Auth** — Full signup/login flow with client+server-side validation and error modals.
- **Premium UI** — Glassmorphism-inspired design with Framer Motion animations.

## 🛠️ Tech Stack

| Layer       | Technology                                  |
|-------------|---------------------------------------------|
| **Frontend**| Next.js 16, React 19, Tailwind CSS 4, Framer Motion |
| **Backend** | Spring Boot 4, Spring Security, Hibernate/JPA |
| **Database**| MySQL 8                                     |
| **Auth**    | BCrypt password hashing, API key authentication |

## 📦 Local Development

### Prerequisites
- Java 17+
- Node.js 18+
- MySQL 8+ (with a database called `api_limiter`)

### Backend
```bash
# Configure your database
cp src/main/resources/application.properties.example src/main/resources/application.properties
# Edit application.properties with your MySQL credentials

# Run the backend
./mvnw spring-boot:run
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

The frontend runs on `http://localhost:3000`, the backend on `http://localhost:8080`.

## 🌐 Deployment

| Component   | Platform | Free Tier |
|-------------|----------|-----------|
| Backend     | [Railway](https://railway.app) | ✅ $5 trial |
| Frontend    | [Vercel](https://vercel.com) | ✅ Free |

### Environment Variables

**Backend (Railway):**
```
DATABASE_URL=jdbc:mysql://<host>:<port>/<db>
DATABASE_USERNAME=<user>
DATABASE_PASSWORD=<password>
CORS_ALLOWED_ORIGINS=https://your-frontend.vercel.app
```

**Frontend (Vercel):**
```
NEXT_PUBLIC_API_URL=https://your-backend.up.railway.app
```

## 📁 Project Structure

```
maxrate/
├── src/main/java/com/project/api_limiting/
│   ├── config/          # Security & CORS configuration
│   ├── controller/      # REST API endpoints
│   ├── dto/             # Request/Response DTOs
│   ├── entity/          # JPA entities (User, RateLimitRule, RequestLog)
│   ├── exception/       # Global error handling
│   ├── filter/          # Rate limit filter (API key validation)
│   ├── repository/      # Data access layer
│   └── service/         # Business logic
├── frontend/
│   ├── app/             # Next.js pages (dashboard, logs, rate-limits, api-keys)
│   ├── components/      # Reusable UI components
│   └── lib/             # API client & utilities
├── Dockerfile           # Production Docker build
└── pom.xml              # Maven configuration
```

---

Built with ❤️ for Modern Engineering Teams.
