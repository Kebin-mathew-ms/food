# Authentication, Authorization, & User Management System

This document outlines the architecture, flow diagrams, API specs, and RBAC policies implemented for the **Food Waste Redistribution Platform**.

---

## 1. Flow Diagrams

### JWT Authentication Flow
```mermaid
sequenceDiagram
    autonumber
    actor Client as Client App
    actor Server as Node.js Express API
    actor DB as MySQL Database

    Client->>Server: POST /api/auth/login (email, password)
    Server->>DB: query user where email matches
    DB-->>Server: return user details & password hash
    Server->>Server: verify password (bcrypt compare)
    Server->>Server: generate Access Token (15m) & Refresh Token (7d)
    Server->>Server: hash refresh token (SHA-256)
    Server->>DB: insert hashed refresh token session
    DB-->>Server: save confirmation
    Server-->>Client: return JSON (accessToken, refreshToken, user profile)
```

---

### Sliding Refresh Token Rotation Flow
```mermaid
sequenceDiagram
    autonumber
    actor Client as Client App
    actor Server as Node.js Express API
    actor DB as MySQL Database

    Client->>Server: Request with expired Access Token (Authorization: Bearer <token>)
    Server-->>Client: 401 Unauthorized ("Access token has expired.")
    Note over Client: Axios interceptor catches 401
    Client->>Server: POST /api/auth/refresh-token { refreshToken }
    Server->>Server: hash incoming token (SHA-256)
    Server->>DB: query active refresh token match
    DB-->>Server: return refresh token record & user profile
    Note over Server: Verify token is not expired or revoked
    Server->>Server: generate new Access Token (15m) & Refresh Token (7d)
    Server->>DB: delete old token record
    Server->>DB: save new hashed token record
    Server-->>Client: return new accessToken & new refreshToken
    Note over Client: Axios retries original failed request
```

---

### Password Reset Flow
```mermaid
sequenceDiagram
    autonumber
    actor User
    actor Client as Client App
    actor Server as Node.js Express API
    actor DB as MySQL Database

    User->>Client: Click "Forgot Password" & enter Email
    Client->>Server: POST /api/auth/forgot-password { email }
    Server->>DB: query user by email
    DB-->>Server: user found
    Server->>Server: generate random reset token & expiry (15m)
    Server->>DB: save reset token & expiry to user record
    Server->>Server: log / send dispatch containing token
    Server-->>Client: 200 OK ("If the email exists, a link will be sent...")
    Note over User: User clicks reset link in email
    User->>Client: Enter new password
    Client->>Server: POST /api/auth/reset-password { token, password }
    Server->>DB: query user by reset token
    DB-->>Server: return user record
    Server->>Server: verify token expiry & bcrypt hash new password
    Server->>DB: save new password, clear reset token columns
    Server-->>Client: 200 OK ("Password has been reset.")
```

---

## 2. API Documentation

### Public Endpoints

| Method | Endpoint | Description | Payload Schema | Response (Success) |
| :--- | :--- | :--- | :--- | :--- |
| **POST** | `/api/auth/register` | Register a new user profile | `{ full_name, email, phone, password, confirm_password, role, address, city, state, country, latitude, longitude }` | `201 Created` - `{ success: true, message: "...", data: user }` |
| **POST** | `/api/auth/login` | Authenticate credentials & return tokens | `{ email, password }` | `200 OK` - `{ success: true, data: { accessToken, refreshToken, user } }` |
| **POST** | `/api/auth/logout` | Revoke a single refresh token session | `{ refreshToken }` | `200 OK` - `{ success: true, message: "Successfully logged out." }` |
| **POST** | `/api/auth/refresh-token` | Rotate access and refresh tokens | `{ refreshToken }` | `200 OK` - `{ success: true, data: { accessToken, refreshToken } }` |
| **POST** | `/api/auth/forgot-password` | Request password reset token | `{ email }` | `200 OK` - `{ success: true, message: "..." }` |
| **POST** | `/api/auth/reset-password` | Change password using reset token | `{ token, password, confirm_password }` | `200 OK` - `{ success: true, message: "..." }` |
| **POST** | `/api/auth/verify-email` | Activate email status using token | `{ token }` | `200 OK` - `{ success: true, message: "..." }` |
| **POST** | `/api/auth/resend-verification` | Resend account verification token | `{ email }` | `200 OK` - `{ success: true, message: "..." }` |

### Protected Endpoints (Requires `Authorization: Bearer <accessToken>`)

| Method | Endpoint | Description | Guard Middlewares | Response (Success) |
| :--- | :--- | :--- | :--- | :--- |
| **POST** | `/api/auth/logout-all` | Revoke all active sessions of user | `auth` | `200 OK` - `{ success: true, message: "..." }` |
| **POST** | `/api/auth/change-password` | Update password from settings page | `auth` | `200 OK` - `{ success: true, message: "..." }` |
| **GET** | `/api/auth/profile` | Retrieve active profile details | `auth` | `200 OK` - `{ success: true, data: user }` |
| **PUT** | `/api/auth/profile` | Update profile fields & upload avatar | `auth` | `200 OK` - `{ success: true, data: user }` |

---

## 3. Role-Based Access Control (RBAC)

Access control rules are enforced by the `roleMiddleware(...allowedRoles)` helper.

### Configured System Roles
- `ADMIN`: Full backend access, bypasses resource ownership rules, user management operations.
- `DONOR`: Food donors (restaurant owner, supermarket manager, individual) contributing surplus food.
- `NGO`: Non-governmental organization staff accessing donation request list and coordination feeds.
- `VOLUNTEER`: Couriers driving collections and distributions.

### Example Route Enforcement
```javascript
import roleMiddleware from '../middlewares/role.middleware.js';

// Route accessible only by ADMIN and NGO roles
router.get('/coordinates', authMiddleware, roleMiddleware('ADMIN', 'NGO'), getCoordinates);
```
