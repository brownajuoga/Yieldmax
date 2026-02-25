package compost

import (
	"encoding/json"
	"net/http"
)

func RegisterRoutes(mux *http.ServeMux) {

	mux.HandleFunc("/compost", func(w http.ResponseWriter, r *http.Request) {

		var req CompostRequest
		json.NewDecoder(r.Body).Decode(&req)

		plan := Plan(req)

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(plan)
	})
}