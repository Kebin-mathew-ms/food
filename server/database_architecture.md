# Database Architecture - Food Waste Redistribution Platform

This document describes the database design, tables, relationships, indexes, unique constraints, and operational guides (migration and seeding) for the platform.

---

## 📊 Entity Relationship (ER) Diagram

```mermaid
erDiagram
    users {
        string id PK
        string full_name
        string email UK
        string phone UK
        string password
        enum role
        enum status
        string profile_image
        string address
        string city
        string state
        string country
        float latitude
        float longitude
        boolean email_verified
        datetime last_login
        datetime created_at
        datetime updated_at
        datetime deleted_at
        string created_by
        string updated_by
    }

    food_donations {
        string id PK
        string donor_id FK
        string food_name
        string food_category
        enum food_type
        string description
        float quantity
        string quantity_unit
        int number_of_people
        datetime prepared_at
        datetime expiry_time
        string pickup_address
        string pickup_city
        string pickup_state
        string pickup_country
        float pickup_latitude
        float pickup_longitude
        string special_instructions
        enum status
        datetime created_at
        datetime updated_at
        datetime deleted_at
        string created_by
        string updated_by
    }

    donation_images {
        string id PK
        string donation_id FK
        string image_url
        string public_id
        int display_order
        datetime created_at
        datetime updated_at
        datetime deleted_at
        string created_by
        string updated_by
    }

    ngos {
        string id PK
        string user_id FK
        string organization_name
        string registration_number UK
        string license_document
        string website
        string description
        boolean verified
        datetime created_at
        datetime updated_at
        datetime deleted_at
        string created_by
        string updated_by
    }

    volunteers {
        string id PK
        string user_id FK
        string vehicle_type
        string vehicle_number
        boolean availability
        float current_latitude
        float current_longitude
        boolean is_online
        datetime created_at
        datetime updated_at
        datetime deleted_at
        string created_by
        string updated_by
    }

    donation_requests {
        string id PK
        string donation_id FK
        string ngo_id FK
        enum request_status
        datetime requested_at
        datetime approved_at
        datetime rejected_at
        string remarks
        datetime created_at
        datetime updated_at
        datetime deleted_at
        string created_by
        string updated_by
    }

    deliveries {
        string id PK
        string donation_request_id FK
        string volunteer_id FK
        datetime pickup_time
        datetime delivery_time
        datetime completion_time
        enum delivery_status
        string pickup_photo
        string delivery_photo
        string proof_signature
        string delivery_notes
        datetime created_at
        datetime updated_at
        datetime deleted_at
        string created_by
        string updated_by
    }

    notifications {
        string id PK
        string user_id FK
        string title
        string message
        enum type
        boolean is_read
        datetime sent_at
        datetime created_at
        datetime updated_at
        datetime deleted_at
        string created_by
        string updated_by
    }

    complaints {
        string id PK
        string user_id FK
        string subject
        string description
        string status
        string admin_response
        datetime created_at
        datetime updated_at
        datetime deleted_at
        string created_by
        string updated_by
    }

    feedback {
        string id PK
        string delivery_id FK
        int rating
        string review
        datetime created_at
        datetime updated_at
        datetime deleted_at
        string created_by
        string updated_by
    }

    audit_logs {
        string id PK
        string user_id FK
        string action
        string table_name
        string record_id
        string old_values
        string new_values
        string ip_address
        string user_agent
        datetime created_at
        datetime updated_at
        datetime deleted_at
        string created_by
        string updated_by
    }

    system_settings {
        string id PK
        string setting_key UK
        string setting_value
        string description
        datetime created_at
        datetime updated_at
        datetime deleted_at
        string created_by
        string updated_by
    }

    users ||--o{ food_donations : "donates"
    users ||--o| ngos : "extends profile"
    users ||--o| volunteers : "extends profile"
    users ||--o{ notifications : "receives"
    users ||--o{ complaints : "logs"
    users ||--o{ audit_logs : "triggers"

    food_donations ||--o{ donation_images : "contains"
    food_donations ||--o{ donation_requests : "receives"

    ngos ||--o{ donation_requests : "requests"
    donation_requests ||--o| deliveries : "scheduled for"

    volunteers ||--o{ deliveries : "delivers"
    deliveries ||--o| feedback : "gathers"
```

---

## 📝 Tables & Field Descriptions

### 1. `users`
Stores accounts for all system participants.
- **`id`** (UUID, PK): Unique identifier.
- **`role`** (Enum: `ADMIN`, `DONOR`, `NGO`, `VOLUNTEER`): System role.
- **`status`** (Enum: `ACTIVE`, `INACTIVE`, `BLOCKED`): Status flag.
- **`email_verified`**: Email verification check.

### 2. `food_donations`
Surplus food donation records posted by Donors.
- **`donor_id`** (UUID, FK -> `users.id`): References the donor account.
- **`food_type`** (Enum: `VEG`, `NON_VEG`, `VEGAN`, `OTHER`): Food categorization.
- **`prepared_at` / `expiry_time`**: Safety tracking boundaries.
- **`status`** (Enum: `AVAILABLE`, `REQUESTED`, `APPROVED`, `PICKED_UP`, `DELIVERED`, `EXPIRED`, `CANCELLED`): Donation lifecycle state.

### 3. `donation_images`
Multiple image listings showing donated items.
- **`donation_id`** (UUID, FK -> `food_donations.id`): Backlink with **CASCADE DELETE**.

### 4. `ngos`
Detailed organization details for NGO profiles.
- **`user_id`** (UUID, FK -> `users.id`, Unique): Links directly to user account.
- **`registration_number`** (Unique): Governmental non-profit registry number.
- **`verified`**: Approval verification flag.

### 5. `volunteers`
Delivery courier profiles.
- **`user_id`** (UUID, FK -> `users.id`, Unique): Reference backlink.
- **`is_online` / `availability`**: Real-time matching signals.

### 6. `donation_requests`
Requested claims by NGOs for available food donations.
- **`donation_id`** (UUID, FK -> `food_donations.id`): Linked donation (**CASCADE DELETE**).
- **`ngo_id`** (UUID, FK -> `ngos.id`): Requesting NGO profile (**RESTRICT**).
- **`request_status`** (Enum: `PENDING`, `APPROVED`, `REJECTED`).

### 7. `deliveries`
Shipment courier tracking mapping.
- **`donation_request_id`** (UUID, FK -> `donation_requests.id`, Unique): Link to request (**RESTRICT**).
- **`volunteer_id`** (UUID, FK -> `volunteers.id`, Nullable): Assigned courier (**RESTRICT**).
- **`delivery_status`** (Enum: `ASSIGNED`, `PICKED_UP`, `IN_TRANSIT`, `DELIVERED`, `FAILED`).

### 8. `notifications`
User alerts and system event notifications.
- **`user_id`** (UUID, FK -> `users.id`): Backlink (**CASCADE DELETE**).

### 9. `complaints`
Tickets logged by platform users for admin review.
- **`user_id`** (UUID, FK -> `users.id`): Submitting user (**CASCADE DELETE**).

### 10. `feedback`
Post-delivery NGO reviews.
- **`delivery_id`** (UUID, FK -> `deliveries.id`, Unique): Target delivery (**CASCADE DELETE**).

### 11. `audit_logs`
Automated system trails logging write operations.
- **`user_id`** (UUID, FK -> `users.id`, Nullable): Performer ID (**SET NULL**).

### 12. `system_settings`
Centralized application settings variables (e.g. maximum delivery radius).

---

## 🛠️ Operations Guide

### Initial Database Setup & Migration
To apply the database design schema onto MySQL:
```bash
# 1. Ensure MySQL is running and database 'food' exists
# 2. Run the initial migration command
npm run prisma:migrate --prefix server
```
This executes `prisma migrate dev`, generating the SQL table schema mapping, indexes, and FK rules dynamically inside MySQL.

### Database Seeding
To fill the database tables with default parameter stubs and testing records:
```bash
# Execute seeding script
npx prisma db seed --schema=server/prisma/schema.prisma
```
This deletes pre-existing rows and populates the tables with consistent entity graphs (1 Admin, 2 NGOs, 3 Volunteers, 5 Donors, 20 Donations, 20 Requests, 10 Deliveries, Feedbacks, and Settings).
