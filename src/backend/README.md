# Yieldmax Backend

Go backend for nutrient diagnosis, organic farming knowledge, and farm intervention tracking.

## Architecture

**Multi-file dataset system** with indexed queries:
- Load all `*.json` files from module directories
- File modification time caching (reload only on changes)
- O(1) lookups via in-memory indexes (crop/nutrient maps)
- RFC3339 versioned sync for offline-first clients

**Modules:**
- **Diagnosis**: Crop symptom → nutrient deficiency detection
- **Knowledge**: Organic compost preparation guidance
- **Advisory**: Combined diagnosis + knowledge in one request
- **Compost**: Material nutrient profiles (NPK, Ca)
- **Reports**: Farm intervention tracking with yield metrics
- **Versioning**: Module version management for client sync

## Quick Start

```bash
cd src/backend
go run .
```

Server runs on `http://localhost:9000`

## Example Requests

**Diagnose nutrient deficiency:**
```bash
curl -X POST http://localhost:9000/diagnosis \
  -H "Content-Type: application/json" \
  -d '{"crop":"maize","symptom":"yellow_lower_leaves"}' | jq .
```

**Get compost materials:**
```bash
curl http://localhost:9000/compost/materials | jq .
```

**Get farm reports:**
```bash
curl "http://localhost:9000/reports/farm?id=F001" | jq .
```

**Check for rule updates:**
```bash
curl "http://localhost:9000/diagnosis/sync?version=2024-01-01T00:00:00Z" | jq .
```

## Project Structure

```
src/backend/
├── main.go              # Entry point
├── router.go            # Route registration
├── modules/
│   ├── diagnosis/       # Nutrient deficiency detection
│   ├── knowledge/       # Compost preparation guidance
│   ├── advisory/        # Combined diagnosis + knowledge
│   ├── compost/         # Material nutrient profiles
│   ├── reports/         # Farm intervention tracking
│   └── versioning/      # Module version management
└── data/
    ├── diagnosis/       # Rule JSON files
    ├── knowledge/       # Guidance JSON files
    ├── compost/         # Material JSON files
    └── reports/         # Seed data
```

## Data Management

**Add new rules/knowledge:**
1. Create new JSON file in appropriate `data/` directory
2. Follow existing structure with `version` and `entries`/`rules`/`materials`
3. Backend auto-loads on next request (if file modified)

**Example structure:**
```json
{
  "version": "2026-02-25T00:00:00Z",
  "rules": [...]
}
```

## Performance

- **Indexed queries**: O(1) crop/nutrient lookups
- **Smart caching**: Reload only when files change
- **Thread-safe**: sync.RWMutex on all repositories
- **Efficient sync**: Version-based incremental updates

## API Documentation

Find the complete documentation at [REQUESTS.md](../../docs/REQUESTS.md)