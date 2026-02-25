package versioning

import (
	"encoding/json"
	"net/http"
)

func RegisterRoutes(mux *http.ServeMux) {

	mux.HandleFunc("/version", func(w http.ResponseWriter, r *http.Request) {
		json.NewEncoder(w).Encode(GetVersion())
	})
}