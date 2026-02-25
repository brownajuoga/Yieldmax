package reports

import (
	"encoding/json"
	"net/http"
)

func RegisterRoutes(mux *http.ServeMux) {

	mux.HandleFunc("/reports", func(w http.ResponseWriter, r *http.Request) {

		if r.Method == http.MethodPost {
			var report FieldReport
			json.NewDecoder(r.Body).Decode(&report)
			Submit(report)
			w.WriteHeader(http.StatusCreated)
			return
		}

		if r.Method == http.MethodGet {
			json.NewEncoder(w).Encode(GetAll())
		}
	})
}