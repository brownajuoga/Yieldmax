package knowledge

import (
	"encoding/json"
	"net/http"
)

func RegisterRoutes(mux *http.ServeMux, ruleFilePath string) {
	repo := &JSONRepository{FilePath: ruleFilePath}
	service, err := NewService(repo)
	if err != nil {
		panic(err)
	}

	// Get guidance by crop
	mux.HandleFunc("/knowledge/crop", func(w http.ResponseWriter, r *http.Request) {
		crop := r.URL.Query().Get("name")
		if crop == "" {
			http.Error(w, "Missing crop query parameter", http.StatusBadRequest)
			return
		}

		data, _ := service.GetGuidanceForCrop(crop)
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(data)
	})

	// Get guidance by nutrient
	mux.HandleFunc("/knowledge/nutrient", func(w http.ResponseWriter, r *http.Request) {
		nutrient := r.URL.Query().Get("name")
		if nutrient == "" {
			http.Error(w, "Missing nutrient query parameter", http.StatusBadRequest)
			return
		}

		data, _ := service.GetGuidanceForNutrient(nutrient)
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(data)
	})
}
