package reports

import (
	"encoding/json"
	"net/http"
)

func RegisterRoutes(mux *http.ServeMux) {
	repo := NewInMemoryRepository()
	service := NewService(repo)

	mux.HandleFunc("/reports/farm", func(w http.ResponseWriter, r *http.Request) {
		farmID := r.URL.Query().Get("id")
		if farmID == "" {
			http.Error(w, "id query param required", http.StatusBadRequest)
			return
		}
		data, _ := service.ListReportsByFarm(farmID)
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(data)
	})

	mux.HandleFunc("/reports/crop", func(w http.ResponseWriter, r *http.Request) {
		crop := r.URL.Query().Get("name")
		if crop == "" {
			http.Error(w, "name query param required", http.StatusBadRequest)
			return
		}
		data, _ := service.ListReportsByCrop(crop)
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(data)
	})

	mux.HandleFunc("/reports", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			w.WriteHeader(http.StatusMethodNotAllowed)
			return
		}

		var report FarmReport
		if err := json.NewDecoder(r.Body).Decode(&report); err != nil {
			http.Error(w, "Invalid request body", http.StatusBadRequest)
			return
		}

		if err := service.RecordReport(report); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusCreated)
	})
}
