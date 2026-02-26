package main

import (
	"encoding/json"
	"log"
	"net/http"
	"github.com/gorilla/mux"
)

// In-memory data
var marketOffers = []map[string]string{
	{"type": "Banana Peels", "looking_for": "Nitrogen", "contact": "Farmer John 0712..."},
}
var userFarms = []map[string]string{
	{"id": "1", "name": "Green Acres", "location": "Nairobi", "crop": "Maize"},
}
var farmReports = []map[string]string{}

func main() {
	r := mux.NewRouter()

	// Knowledge & Diagnosis
	r.HandleFunc("/knowledge/crop", func(w http.ResponseWriter, r *http.Request) {
		name := r.URL.Query().Get("name")
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{"crop": name, "info": "Data for " + name})
	}).Methods("GET")

	r.HandleFunc("/diagnosis", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{"nutrient": "nitrogen", "actions": []string{"Add compost"}})
	}).Methods("POST", "OPTIONS")

	// Marketplace
	r.HandleFunc("/market", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		if r.Method == "GET" {
			json.NewEncoder(w).Encode(marketOffers)
		} else {
			var offer map[string]string
			json.NewDecoder(r.Body).Decode(&offer)
			marketOffers = append(marketOffers, offer)
			json.NewEncoder(w).Encode(offer)
		}
	}).Methods("GET", "POST", "OPTIONS")

	// Farms & Reports (Required for MyFarm.jsx)
	r.HandleFunc("/farm/list", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(userFarms)
	}).Methods("GET", "OPTIONS")

	r.HandleFunc("/reports", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		if r.Method == "GET" {
			json.NewEncoder(w).Encode(farmReports)
		} else {
			var report map[string]string
			json.NewDecoder(r.Body).Decode(&report)
			farmReports = append(farmReports, report)
			json.NewEncoder(w).Encode(report)
		}
	}).Methods("GET", "POST", "OPTIONS")

	log.Println("✅ YieldMax Backend Running on :9000")
	log.Fatal(http.ListenAndServe("0.0.0.0:9000", corsMiddleware(r)))
}

func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}
		next.ServeHTTP(w, r)
	})
}