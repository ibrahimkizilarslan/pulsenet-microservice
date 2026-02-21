# 🔥 PulseNet — Microservices Social Media Platform

A production-grade microservices social media platform built on .NET 8 / ASP.NET Core with MongoDB, JWT authentication, a custom API Gateway, and full observability stack.

## 🏗️ Architecture

```
┌──────────────────────────────────────────────┐
│              EXTERNAL CLIENTS                │
│            (Web, Mobile, etc.)               │
└──────────────────┬───────────────────────────┘
                   │ :8080
┌──────────────────▼───────────────────────────┐
│           PulseNet.Gateway                   │
│     (JWT Validation • Routing • Forwarding)  │
│     X-Internal-Gateway: PulseNetSecret       │
│     X-Correlation-Id: auto-generated         │
└───┬────┬────┬────┬────┬──────────────────────┘
    │    │    │    │    │     internal_net
┌───▼┐┌──▼┐┌─▼──┐┌▼───┐┌▼───────┐
│Auth││User││Post││Foll││Timeline│
│:5001│:5002│:5003│:5004│ :5005  │
└─┬──┘└─┬──┘└─┬──┘└─┬──┘└─┬─────┘
  │     │     │     │     │
┌─▼──┐┌─▼──┐┌─▼──┐┌─▼──┐┌─▼──┐
│Mong││Mong││Mong││Mong││Mong│  (isolated DBs)
└────┘└────┘└────┘└────┘└────┘
```

## 📦 Solution Structure

```
PulseNet.slnx

src/
├── BuildingBlocks/PulseNet.BuildingBlocks/       # Shared: JWT, Middleware, Mongo, Serilog
├── Gateway/PulseNet.Gateway/                     # Custom API Gateway (NO YARP)
│   ├── Auth/GatewayAuthZ.cs                      #   JWT + role validation
│   ├── Routing/RouteTable.cs + RouteMatcher.cs   #   Path → downstream mapping
│   └── Forwarding/Forwarder.cs                   #   HttpClient forward logic
└── Services/
    ├── Auth/PulseNet.Auth.Api/                   # Register/Login + JWT issuance
    ├── Users/PulseNet.Users.Api/                 # User profiles CRUD
    ├── Posts/PulseNet.Posts.Api/                  # Posts CRUD
    ├── Follows/PulseNet.Follows.Api/             # Follow/unfollow relationships
    └── Timeline/PulseNet.Timeline.Api/           # Timeline feed

tests/
└── PulseNet.Gateway.Tests/                       # xUnit: routing, auth, error handling

infra/
├── docker-compose.yml                            # Full stack orchestration
├── prometheus/prometheus.yml                     # Prometheus scrape configs
└── grafana/provisioning/                         # Grafana datasource provisioning

loadtest/
└── smoke-test.js                                 # k6 load test placeholder
```

## 🚀 Quick Start

### Prerequisites
- .NET 8 SDK (or 9+)
- Docker & Docker Compose

### Run Tests
```bash
dotnet test tests/PulseNet.Gateway.Tests/PulseNet.Gateway.Tests.csproj
```

### Run with Docker Compose
```bash
cd infra
docker-compose up --build
```

Gateway will be available at `http://localhost:8080`

### API Endpoints
| Route | Service | Auth Required |
|-------|---------|---------------|
| `POST /api/auth/register` | Auth | ❌ |
| `POST /api/auth/login` | Auth | ❌ |
| `GET /api/users/{id}` | Users | ✅ |
| `POST /api/posts` | Posts | ✅ |
| `GET /api/posts/recent` | Posts | ✅ |
| `POST /api/follows` | Follows | ✅ |
| `GET /api/timeline/{userId}` | Timeline | ✅ |
| `GET /health` | Gateway | ❌ |

## 🔒 Security

- **JWT Authentication**: All services behind the gateway require a valid JWT (except `/api/auth` routes)
- **Internal Gateway Header**: Backend services reject any request without `X-Internal-Gateway: PulseNetSecret`
- **Network Isolation**: Only the Gateway is exposed on `public_net`. All services run on `internal_net`

## 📊 Observability

- **Serilog**: Structured logging with correlation IDs across all services
- **Prometheus**: Metrics scraping at `:9090`
- **Grafana**: Dashboard at `:3000` (admin/admin)

## 🧪 Test Coverage

18 tests covering:
- **Routing**: Path-to-service mapping, subpath forwarding, unknown routes (404)
- **Authorization**: No token (401), valid token (200), invalid token (401), expired token (401)
- **Error Handling**: Downstream unreachable (503), timeout (504), error forwarding
- **Infrastructure**: Internal gateway header injection, correlation ID propagation

## 📐 Design Principles

- **SOLID** throughout
- **Minimal API**: Clean, concise endpoint definitions
- **Database-per-service**: Each microservice has its own MongoDB instance
- **No YARP**: Custom lightweight request forwarder
- **BuildingBlocks**: Shared abstractions without coupling