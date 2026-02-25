package versioning

import (
	"encoding/json"
	"net/http"
)

func RegisterRoutes(mux *http.ServeMux) {
	repo := NewInMemoryRepository()
	service := NewService(repo)

	mux.HandleFunc("/versioning/module", func(w http.ResponseWriter, r *http.Request) {
		module := r.URL.Query().Get("name")
		if module == "" {
			http.Error(w, "name query param required", http.StatusBadRequest)
			return
		}
		v, _ := service.GetVersion(module)
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(v)
	})

	mux.HandleFunc("/versioning/all", func(w http.ResponseWriter, r *http.Request) {
		all, _ := service.ListAllVersions()
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(all)
	})
}
