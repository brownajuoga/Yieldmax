# requests

## diagnosis as a service

```bash
curl -X POST http://localhost:9000/diagnosis      -H "Content-Type: application/json"      -d '{
    "crop": "maize",
    "symptom": "yellow_lower_leaves"
}' | jq .
```

## knowledge as a ervice

```bash
curl "http://localhost:9000/knowledge/crop?name=maize" | jq .
curl "http://localhost:9000/knowledge/nutrient?name=potassium" | jq .
```


# advisory = knowledge + diagnosis

```bash
curl -X POST http://localhost:9000/advisory \
     -H "Content-Type: application/json" \
     -d '{
           "crop": "maize",
           "symptom": "yellow_lower_leaves"
         }' | jq .
```
