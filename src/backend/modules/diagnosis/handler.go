package diagnosis

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"
)

// RegisterRoutes initializes repository and service, then registers HTTP handlers.
func RegisterRoutes(mux *http.ServeMux, ruleFilePath string) {
	// Initialize repository
	repo := &JSONRepository{
		FilePath: ruleFilePath,
	}

	// Initialize service
	service, err := NewDiagnosticService(repo)
	if err != nil {
		panic(fmt.Sprintf("Failed to initialize diagnostic service: %v", err))
	}

	// -------------------------------
	// /diagnosis endpoint: POST
	// -------------------------------
	mux.HandleFunc("/diagnosis", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			w.WriteHeader(http.StatusMethodNotAllowed)
			return
		}

		var input DiagnosisRequest
		if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
			http.Error(w, fmt.Sprintf("Invalid request: %v", err), http.StatusBadRequest)
			return
		}

		result, err := service.Diagnose(input)
		if err != nil {
			http.Error(w, fmt.Sprintf("Diagnosis error: %v", err), http.StatusInternalServerError)
			return
		}

		if result == nil {
			http.Error(w, "No matching diagnosis rule found", http.StatusNotFound)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(result)
	})

	// -------------------------------
	// /diagnosis/sync endpoint: GET
	// Frontend sends ?version=RFC3339
	// -------------------------------
	mux.HandleFunc("/diagnosis/sync", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			w.WriteHeader(http.StatusMethodNotAllowed)
			return
		}

		clientVersionStr := r.URL.Query().Get("version")
		if clientVersionStr == "" {
			http.Error(w, "Missing version parameter", http.StatusBadRequest)
			return
		}

		clientVersion, err := time.Parse(time.RFC3339, clientVersionStr)
		if err != nil {
			http.Error(w, "Invalid version format, must be RFC3339", http.StatusBadRequest)
			return
		}

		ruleset, hasUpdate, err := service.CheckForUpdates(clientVersion)
		if err != nil {
			http.Error(w, fmt.Sprintf("Error checking updates: %v", err), http.StatusInternalServerError)
			return
		}

		if !hasUpdate {
			w.WriteHeader(http.StatusNoContent) // 204 = no new rules
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(ruleset)
	})
}
