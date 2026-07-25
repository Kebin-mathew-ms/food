# Donor Module API & Components Documentation

This document covers the specifications, component breakdowns, and sequence flows implemented for the **Donor Module** of the **Food Waste Redistribution Platform**.

---

## 1. Donation Lifecycle Flow
```mermaid
stateDiagram-sync
    [*] --> AVAILABLE : Create Donation Listing
    AVAILABLE --> REQUESTED : Claim Requested by NGO
    AVAILABLE --> EXPIRED : Expiry Time Reached
    AVAILABLE --> CANCELLED : Cancelled by Donor
    REQUESTED --> APPROVED : Approved by Donor
    REQUESTED --> AVAILABLE : Request Denied
    APPROVED --> PICKED_UP : Collected by Volunteer
    PICKED_UP --> DELIVERED : Distributed to Shelter
    EXPIRED --> [*]
    CANCELLED --> [*]
    DELIVERED --> [*]
```

---

## 2. API Endpoint Specifications

All endpoints require `Authorization: Bearer <accessToken>`.

### List Donations
- **Endpoint**: `GET /api/donations`
- **Query Params**:
  - `search` (string) - Text filter (matches food_name, description, pickup_address)
  - `category` (string) - Filter by category enum
  - `type` (string) - Diet type (`VEG`, `NON_VEG`, `VEGAN`, `OTHER`)
  - `status` (string) - Donation status
  - `page` (number) - Active index (defaults to 1)
  - `limit` (number) - Page size (defaults to 10)
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "message": "Food donations list retrieved successfully.",
    "data": {
      "records": [ ... ],
      "metadata": {
        "page": 1,
        "limit": 10,
        "last_page": 4,
        "total": 38
      }
    }
  }
  ```

### Create Donation
- **Endpoint**: `POST /api/donations`
- **Body Schema**:
  ```json
  {
    "food_name": "Veggie Stir Fry",
    "food_category": "Cooked Food",
    "food_type": "VEGAN",
    "description": "Portion size for 20 people. Prepared fresh.",
    "quantity": 5.0,
    "quantity_unit": "kg",
    "number_of_people": 20,
    "prepared_at": "2026-07-15T12:00:00.000Z",
    "expiry_time": "2026-07-15T18:00:00.000Z",
    "pickup_time": "2026-07-15T14:00:00.000Z",
    "pickup_address": "456 Lexington Ave, NY",
    "pickup_city": "New York",
    "pickup_state": "NY",
    "pickup_country": "US",
    "postal_code": "10017",
    "pickup_latitude": 40.7516,
    "pickup_longitude": -73.9748,
    "pickup_contact_name": "Jane Smith",
    "pickup_contact_phone": "+15550222"
  }
  ```
- **Response `201 Created`**: Returns the saved donation listing object wrapper.

---

## 3. Reusable UI Components

- **`DonationCard`**: Standard display tile displaying food category, title, servants weight details, map link, cancel trigger, and countdown timers.
- **`DonationForm`**: Central hook form wrapping validations and Leaflet location picks.
- **`LocationPickerMap`**: Leaflet maps integration parsing coordinates and auto-detecting current locations.
- **`CountdownTimer`**: Live interval ticker verifying expiration and trigger state updates.
- **`ImageUploader`**: Multer buffer manager letting users drag, reorder, delete, and list up to 5 photos.
- **`DonationTimeline`**: Visual progress stepper.
