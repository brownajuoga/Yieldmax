# Yieldmax API Contract (Frontend Guide)

This document explains how the frontend interacts with the backend services for:

* Diagnosis
* Knowledge
* Advisory (Diagnosis + Knowledge)
* Compost
* Reports
* Versioning
* Syncing updates

Base URL (local development):

```
http://localhost:9000
```

All responses are JSON.

---

# 0. Authentication Service

Purpose:
User registration and login with JWT tokens. Returns offline data package for local storage.

---

## 0.1 Register New User

```
POST /auth/register
```

Request body:

```json
{
  "email": "farmer@example.com",
  "password": "password123",
  "name": "John Kamau",
  "farm": {
    "name": "Green Valley Farm",
    "type": "Mixed Livestock",
    "location": "Nakuru, Rift Valley"
  }
}
```

Example:

```bash
curl -X POST http://localhost:9000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "farmer@example.com",
    "password": "password123",
    "name": "John Kamau",
    "farm": {
      "name": "Green Valley Farm",
      "type": "Mixed Livestock",
      "location": "Nakuru, Rift Valley"
    }
  }' | jq .
```

Response (201 Created):

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_123",
    "email": "farmer@example.com",
    "name": "John Kamau",
    "created_at": "2026-02-25T10:00:00Z"
  },
  "farm": {
    "id": "farm_456",
    "name": "Green Valley Farm",
    "type": "Mixed Livestock",
    "location": "Nakuru, Rift Valley",
    "owner_id": "user_123",
    "created_at": "2026-02-25T10:00:00Z"
  },
  "reports": []
}
```

---

## 0.2 Login

```
POST /auth/login
```

Request body:

```json
{
  "email": "farmer@example.com",
  "password": "password123"
}
```

Example:

```bash
curl -X POST http://localhost:9000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "farmer@example.com",
    "password": "password123"
  }' | jq .
```

Response (200 OK):

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_123",
    "email": "farmer@example.com",
    "name": "John Kamau",
    "created_at": "2026-02-25T10:00:00Z"
  },
  "farm": {
    "id": "farm_456",
    "name": "Green Valley Farm",
    "type": "Mixed Livestock",
    "location": "Nakuru, Rift Valley",
    "owner_id": "user_123",
    "created_at": "2026-02-25T10:00:00Z"
  },
  "reports": [
    {
      "farm_id": "farm_456",
      "crop": "maize",
      "actions_taken": ["Applied leafy compost"],
      "yield_before": 2.5,
      "yield_after": 3.2,
      "date": "2026-02-15T00:00:00Z"
    }
  ]
}
```

**Offline Package:**
The login response includes everything needed for offline operation:
- User profile
- Farm details
- Historical reports

Store this in IndexedDB for offline access.

---


---

## Offline-First Usage Pattern

**Initial Setup (Online):**
1. User registers or logs in
2. Frontend receives complete offline package
3. Store in IndexedDB:
   - JWT token
   - User profile
   - Farm details
   - Historical reports

**Working Offline:**
1. Use cached user/farm data from IndexedDB
2. Create reports locally (queue for sync)
3. Update farm profile locally (queue for sync)
4. All diagnosis/knowledge queries work offline

**Reconnecting (Online):**
1. Send queued reports to backend
2. Send farm profile updates to backend
3. Refresh token if expired
4. Download any new reports from backend

**Authentication Headers:**
All authenticated endpoints require:
```
Authorization: Bearer <jwt_token>
```

Token expires after 24 hours. Refresh by logging in again.

---

# 1. Diagnosis Service

Purpose:
Given a crop and a symptom, return the likely nutrient deficiency and recommended actions.

Endpoint:

```
POST /diagnosis
```

Request body:

```json
{
  "crop": "maize",
  "symptom": "yellow_lower_leaves"
}
```

Example request:

```bash
curl -X POST http://localhost:9000/diagnosis \
  -H "Content-Type: application/json" \
  -d '{
    "crop": "maize",
    "symptom": "yellow_lower_leaves"
}' | jq .
```

Example response:

```json
{
  "nutrient": "nitrogen",
  "confidence": 0.9,
  "actions": [
    "Apply leafy compost",
    "Incorporate before rain"
  ]
}
```

Field meanings:

* nutrient: Identified deficiency.
* confidence: Rule-based confidence score (0–1).
* actions: Recommended corrective steps.

If no match is found, the service returns an empty response or appropriate status (depending on implementation).

Frontend expectation:

* Display nutrient diagnosis.
* Show action list clearly.
* Optionally visualize confidence.

---

# 2. Knowledge Service

Purpose:
Provide compost preparation and application details.

There are two query modes.

---

## 2.1 Query by Crop

```
GET /knowledge/crop?name={crop}
```

Example:

```bash
curl "http://localhost:9000/knowledge/crop?name=maize" | jq .
```

Example response:

```json
[
  {
    "crop": "maize",
    "nutrient": "nitrogen",
    "sources": ["Leafy Compost", "Kale Waste"],
    "preparation": "Mix 1:1 with dry leaves, compost for 4-6 weeks",
    "application": "Apply 3 tonnes/acre 30 days before planting",
    "notes": "Ensure proper moisture to avoid nutrient loss"
  }
]
```

Returns:
All nutrient support entries available for the specified crop.

---

## 2.2 Query by Nutrient

```
GET /knowledge/nutrient?name={nutrient}
```

Example:

```bash
curl "http://localhost:9000/knowledge/nutrient?name=potassium" | jq .
```

Returns:
All crop entries that address the specified nutrient.

Frontend usage:

* Use crop query when browsing a specific crop.
* Use nutrient query when linking from diagnosis results.

---

# 3. Advisory Service

Purpose:
Combine diagnosis + relevant knowledge in one request.

Endpoint:

```
POST /advisory
```

Request:

```json
{
  "crop": "maize",
  "symptom": "yellow_lower_leaves"
}
```

Example:

```bash
curl -X POST http://localhost:9000/advisory \
  -H "Content-Type: application/json" \
  -d '{
    "crop": "maize",
    "symptom": "yellow_lower_leaves"
  }' | jq .
```

Expected behavior:

1. Diagnose deficiency.
2. Retrieve matching knowledge entry for that crop + nutrient.
3. Return combined structured response.

Frontend benefit:

* Single request.
* No need to manually chain diagnosis → knowledge.
* Cleaner UI integration.

---

# 4. Diagnosis Syncing

Purpose:
Allow clients to fetch updated rule data after a specific version.

Endpoint:

```
GET /diagnosis/sync?version={RFC3339 timestamp}
```

Example:

```bash
curl -s "http://localhost:9000/diagnosis/sync?version=2024-01-01T00:00:00Z" | jq .
```

Behavior:

* If server version is newer than the provided timestamp:

  * Returns updated rule set.
* If not:

  * Returns empty or no update response.

Timestamp format must be RFC3339:

```
YYYY-MM-DDTHH:MM:SSZ
```

Frontend responsibility:

* Store last synced version.
* Send it on next sync request.
* Replace or merge rules as required.

---

# 5. Compost Service

Purpose:
Provide compost material information including nutrient content, preparation, and application instructions.

---

## 5.1 List All Materials

```
GET /compost/materials
```

Example:

```bash
curl "http://localhost:9000/compost/materials" | jq .
```

Example response:

```json
[
  {
    "material": "banana_peels",
    "nutrient_content": {
      "N": 0.8,
      "P": 0.3,
      "K": 4.2
    },
    "preparation": "Dry and crush, mix 1:1 with dry leaves, compost for 6-8 weeks",
    "application": "Apply 2 tonnes/acre at flowering stage",
    "notes": "Excellent potassium source for fruiting crops"
  }
]
```

---

## 5.2 Get Material by Name

```
GET /compost/material?name={material}
```

Example:

```bash
curl "http://localhost:9000/compost/material?name=banana_peels" | jq .
```

Returns:
Detailed information for the specified compost material.

---

# 6. Reports Service

Purpose:
Track farm interventions, actions taken, and yield outcomes.

---

## 6.1 Get Reports by Farm

```
GET /reports/farm?id={farm_id}
```

Example:

```bash
curl "http://localhost:9000/reports/farm?id=F001" | jq .
```

Returns:
All reports for the specified farm.

---

## 6.2 Get Reports by Crop

```
GET /reports/crop?name={crop}
```

Example:

```bash
curl "http://localhost:9000/reports/crop?name=maize" | jq .
```

Returns:
All reports for the specified crop across all farms.

---

## 6.3 Record New Report

```
POST /reports
```

Request body:

```json
{
  "farm_id": "F001",
  "crop": "maize",
  "actions_taken": ["Applied leafy compost"],
  "yield_before": 2.5,
  "yield_after": 3.2,
  "date": "2026-02-25T00:00:00Z"
}
```

Example:

```bash
curl -X POST http://localhost:9000/reports \
  -H "Content-Type: application/json" \
  -d '{
    "farm_id": "F001",
    "crop": "maize",
    "actions_taken": ["Applied leafy compost"],
    "yield_before": 2.5,
    "yield_after": 3.2,
    "date": "2026-02-25T00:00:00Z"
  }'
```

Returns:
201 Created on success.

---

# 7. Versioning Service

Purpose:
Track version information for all modules to enable efficient client sync.

---

## 7.1 Get Module Version

```
GET /versioning/module?name={module}
```

Example:

```bash
curl "http://localhost:9000/versioning/module?name=diagnosis" | jq .
```

Example response:

```json
{
  "module": "diagnosis",
  "version": "2026-02-25T10:00:00Z",
  "files": ["maize.json", "tomato.json"]
}
```

---

## 7.2 Get All Module Versions

```
GET /versioning/all
```

Example:

```bash
curl "http://localhost:9000/versioning/all" | jq .
```

Returns:
Version information for all tracked modules.

---
---

# 8. Farm Management Service

Purpose:
Manage farm profile information (requires authentication).

---

## 8.1 Get Farm Profile

```
GET /farm/profile
```

Requires: `Authorization: Bearer <token>` header

Example:

```bash
curl http://localhost:9000/farm/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." | jq .
```

Response:

```json
{
  "id": "farm_456",
  "name": "Green Valley Farm",
  "type": "Mixed Livestock",
  "location": "Nakuru, Rift Valley",
  "owner_id": "user_123",
  "created_at": "2026-02-25T10:00:00Z"
}
```

---

## 8.2 Update Farm Profile

```
PUT /farm/update
```

Requires: `Authorization: Bearer <token>` header

Request body:

```json
{
  "id": "farm_456",
  "name": "Green Valley Farm - Updated",
  "type": "Dairy / Cattle",
  "location": "Nakuru County"
}
```

Example:

```bash
curl -X PUT http://localhost:9000/farm/update \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "id": "farm_456",
    "name": "Green Valley Farm - Updated",
    "type": "Dairy / Cattle",
    "location": "Nakuru County"
  }' | jq .
```

Response:

```json
{
  "id": "farm_456",
  "name": "Green Valley Farm - Updated",
  "type": "Dairy / Cattle",
  "location": "Nakuru County",
  "owner_id": "user_123",
  "created_at": "2026-02-25T10:00:00Z"
}
```

# Summary for Frontend

Authentication:

* POST /auth/register
* POST /auth/login
* Returns JWT + offline package (user, farm, reports)

Farm Management:

* GET /farm/profile (requires auth)
* PUT /farm/update (requires auth)
* Manage farm details

Diagnosis:

* POST /diagnosis
* Returns nutrient + actions

Knowledge:

* GET /knowledge/crop?name=X
* GET /knowledge/nutrient?name=X
* Returns compost instructions

Advisory:

* POST /advisory
* Returns diagnosis + knowledge together

Compost:

* GET /compost/materials
* GET /compost/material?name=X
* Returns material nutrient profiles and preparation

Reports:

* GET /reports/farm?id=X
* GET /reports/crop?name=X
* POST /reports
* Track and retrieve farm intervention data

Versioning:

* GET /versioning/module?name=X
* GET /versioning/all
* Check module versions for sync

Sync:

* GET /diagnosis/sync?version=X
* Returns updated rules if available

Design principle:
Diagnosis explains what is wrong.
Knowledge explains how to fix it.
Advisory combines both for production usage.

This API is deterministic and rule-based. It does not require multiple chained requests unless the frontend chooses to separate concerns.

---

