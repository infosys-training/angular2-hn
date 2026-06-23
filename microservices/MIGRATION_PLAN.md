# Angular2-HN Microservices Migration Plan

## 1. Current Architecture Analysis

### Application Overview
- **Type**: Angular 9 Progressive Web App (PWA)
- **Purpose**: Hacker News client with offline support, themes, and responsive UI
- **External API**: `https://node-hnapi.herokuapp.com` (unofficial HN API proxy)
- **Hosting**: Firebase Hosting with Service Worker (Workbox)
- **LOC**: ~800 lines TypeScript, ~400 lines HTML/SCSS

### Current Monolithic Structure
```
angular2-hn/src/app/
├── app.module.ts                    # Root module (single entry)
├── app.routes.ts                    # All routes in one file
├── shared/
│   ├── services/
│   │   ├── hackernews-api.service.ts  # ALL API calls in one service
│   │   └── settings.service.ts        # Theme/preferences (localStorage)
│   ├── models/                        # 5 data models
│   └── pipes/                         # Comment count pipe
├── feeds/                             # Feed list + item card
├── item-details/                      # Item detail + comments
├── user/                              # User profile
└── core/                              # Header, footer, settings panel
```

### API Endpoints (Current - Single Service)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/{feedType}?page={n}` | Fetch paginated feeds (news, newest, show, ask, jobs) |
| GET | `/item/{id}` | Fetch item details with comments |
| GET | `/user/{id}` | Fetch user profile |

### Identified Problems with Monolith
1. Single `HackerNewsAPIService` handles ALL API concerns (feeds, items, users, polls)
2. Direct dependency on external API with no caching, rate limiting, or fallback
3. No backend layer — frontend directly calls external API
4. No data persistence or caching strategy
5. No fault isolation — one API failure affects entire app

---

## 2. Target Microservices Architecture

### Service Decomposition
```
┌─────────────────────────────────────────────────────────┐
│                  Angular Frontend (PWA)                  │
│              (Service Worker + App Shell)                │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTP/REST
                       ▼
┌──────────────────────────────────────────────────────────┐
│                    API Gateway (:3000)                    │
│  • Request routing    • Rate limiting                    │
│  • Response caching   • Circuit breaker                  │
│  • Health aggregation • CORS management                  │
└───────┬──────────────┬──────────────────┬───────────────┘
        │              │                  │
        ▼              ▼                  ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ Feed Service │ │ Item Service │ │ User Service │
│   (:3001)    │ │   (:3002)    │ │   (:3003)    │
│              │ │              │ │              │
│ • 5 feed     │ │ • Item       │ │ • User       │
│   types      │ │   details    │ │   profiles   │
│ • Pagination │ │ • Comments   │ │ • Karma      │
│ • In-memory  │ │ • Polls      │ │ • Activity   │
│   cache      │ │ • Caching    │ │ • Caching    │
└──────┬───────┘ └──────┬───────┘ └──────┬───────┘
       │                │                │
       ▼                ▼                ▼
┌──────────────────────────────────────────────────────────┐
│            Hacker News API (External)                     │
│         https://node-hnapi.herokuapp.com                  │
└──────────────────────────────────────────────────────────┘
```

### Service Responsibilities

| Service | Port | Responsibility | External API Routes |
|---------|------|---------------|-------------------|
| **API Gateway** | 3000 | Routing, caching, rate limiting, health checks | — |
| **Feed Service** | 3001 | Feed listing (news, newest, show, ask, jobs), pagination | `GET /{type}?page={n}` |
| **Item Service** | 3002 | Item details, comments tree, poll aggregation | `GET /item/{id}` |
| **User Service** | 3003 | User profiles, karma, created date | `GET /user/{id}` |

### Cross-Cutting Concerns
- **Caching**: Each service has TTL-based in-memory cache (node-cache)
  - Feeds: 2 min TTL (frequently updated)
  - Items: 5 min TTL (comments update less often)
  - Users: 15 min TTL (profiles rarely change)
- **Circuit Breaker**: Gateway-level circuit breaker for external API failures
- **Health Checks**: Each service exposes `/health` endpoint
- **Docker**: Each service containerized, orchestrated with docker-compose
- **Logging**: Structured JSON logging per service

---

## 3. Technology Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Backend Services | NestJS 10 + TypeScript | Type-safe, modular, microservice-native framework |
| API Gateway | NestJS + custom proxy | Unified entry point with caching/routing |
| Caching | node-cache (in-memory) | Simple, no external dependency needed |
| HTTP Client | axios | Promise-based, interceptors, timeout support |
| Testing | Jest | Built into NestJS, snapshot + unit testing |
| Containerization | Docker + docker-compose | Service isolation and orchestration |
| Frontend | Angular 9 (existing) | Unchanged except API base URL → gateway |

---

## 4. Upstream/Downstream Dependencies

### Upstream (Data Sources)
| System | Impact | Risk |
|--------|--------|------|
| node-hnapi.herokuapp.com | Primary data source for all services | Heroku shutdown risk — may need migration to official HN Firebase API |
| Official HN Firebase API | Alternative data source (real-time) | Different response format, requires adapter |

### Downstream (Consumers)
| System | Impact | Risk |
|--------|--------|------|
| Angular PWA Frontend | Direct consumer of API Gateway | Must update `baseUrl` in environment config |
| Firebase Hosting | Static hosting, unaffected | No change needed |
| Service Worker (ngsw) | Caches API responses | May need cache strategy update for new URLs |

### Migration Risk Assessment
- **LOW**: Frontend change is minimal (one URL config change)
- **MEDIUM**: External API (Heroku) may be unreliable — caching mitigates this
- **LOW**: No database dependencies to migrate
- **NONE**: No other systems consume this app's APIs

---

## 5. Implementation Phases

### Phase 1: Backend Services (Current PR)
- [x] Feed Service with caching
- [x] Item Service with comment tree + poll support
- [x] User Service with profile caching
- [x] API Gateway with routing and rate limiting
- [x] Shared DTOs and interfaces
- [x] Unit tests for all services
- [x] Docker configuration
- [x] Frontend environment update

### Phase 2: Enhanced Resilience (Future)
- Circuit breaker pattern (e.g., opossum)
- Distributed caching (Redis)
- Message queue for async operations
- Prometheus metrics + Grafana dashboard

### Phase 3: Data Layer (Future)
- PostgreSQL for persistent caching
- Full-text search with Elasticsearch
- User favorites/bookmarks (custom feature)
- Real-time updates via WebSockets
