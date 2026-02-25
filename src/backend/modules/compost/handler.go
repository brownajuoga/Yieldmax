package compost

import (
	"encoding/json"
	"net/http"
)

func RegisterRoutes(mux *http.ServeMux, dirPath string) {
	repo := &JSONRepository{DirPath: dirPath}
	service, err := NewService(repo)
	if err != nil {
		panic(err)
	}

	mux.HandleFunc("/compost/materials", func(w http.ResponseWriter, r *http.Request) {
		data, err := service.ListMaterials()
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(data)
	})

	mux.HandleFunc("/compost/material", func(w http.ResponseWriter, r *http.Request) {
		name := r.URL.Query().Get("name")
		if name == "" {
			http.Error(w, "name query param required", http.StatusBadRequest)
			return
		}
		material, err := service.GetMaterial(name)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		if material == nil {
			http.Error(w, "material not found", http.StatusNotFound)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(material)
	})
}
