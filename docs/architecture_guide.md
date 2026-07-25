# 📚 Food Waste Redistribution - Developer & Architecture Guide

This developer document outlines the system architecture, coding standards, repository/service separation logic, real-time socket room allocations, and background crons engine.

---

## 🏗️ Folder Structure Overview

```text
FoodWasteRedistribution/
├── client/                     # React Single Page Application (PWA)
│   ├── public/                 # Manifest and precached service worker
│   ├── src/
│   │   ├── api/                # Axios instances & endpoints
│   │   ├── components/         # Reusable layouts, tables, and charts
│   │   └── main.jsx            # Entry point registers PWA sw.js
│   └── tests/                  # Vitest component rendering unit tests
├── server/                     # Express Node API Server
│   ├── src/
│   │   ├── config/             # DB client, JWT and Socket servers
│   │   ├── controllers/        # HTTP handler input validations
│   │   ├── docs/               # Swagger specs JSON files
│   │   ├── repositories/       # Direct Prisma database queries
│   │   ├── services/           # Decoupled business rules implementation
│   │   ├── socket/             # Real-time JWT socket room broadcasts
│   │   └── app.js              # Express app initializations
│   └── tests/                  # Jest Supertest integration test files
```

---

## 🎨 Repository & Service Patterns

To satisfy **SOLID** and **DRY** guidelines, the backend is strictly decoupled:
1. **Controllers**: Perform Zod validations, extract parameters, and call the designated service methods.
2. **Services**: Contain pure business rules (e.g. check verification status, verify coordinate radius ranges, match volunteers). They never perform direct database queries.
3. **Repositories**: Act as the single source of truth for database access, querying Prisma clients directly.

---

## 🔌 Socket.io Rooms Architecture

Real-time coordination divides clients into room channels during the JWT authenticated handshakes:
- **Individual Rooms**: `user:${userId}` (for targeting in-app alert notifications).
- **Role Rooms**: `role:${roleName}` (for administrative updates).
- **Distribution Tracking Channels**: `delivery:${deliveryId}` (for volunteers broadcasting Leaflet coordinates updates).

---

## 🕒 Background Cron Jobs Daemon

Background tasks operate on scheduled timers inside [cron.js](file:///c:/Users/Lenovo/Documents/aaropro/food/FoodWasteRedistribution/server/src/config/cron.js):
- **Auto Expiration check**: Runs every minute, checking `expiry_time` parameters on available food listings and updating status to `EXPIRED`.
- **Database Notifications purge**: Runs daily at midnight, purging audit notifications older than 30 days to limit db table bloat.

---

## 🧪 Testing Guidelines

1. **Backend Integration Tests (Jest)**:
   - Run via `npm run test` from `server/`.
   - Uses mock database queries to evaluate router status responses.
2. **Frontend Unit Tests (Vitest & React Testing Library)**:
   - Run via `npx vitest run` from `client/`.
   - Tests layouts mounting, form submittals, contexts, and map coordinate markers.
