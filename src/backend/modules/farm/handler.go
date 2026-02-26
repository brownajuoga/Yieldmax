package farm

import (
	"encoding/json"
	"net/http"
	"strings"
)

type AuthService interface {
	ValidateToken(tokenString string) (interface{}, error)
}

func RegisterRoutes(mux *http.ServeMux, service Service, authService AuthService) {
	// @Summary Get farm profile
	// @Tags Farm
	// @Produce json
	// @Security BearerAuth
	// @Success 200 {object} Farm
	// @Router /farm/profile [get]
	mux.HandleFunc("/farm/profile", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			w.WriteHeader(http.StatusMethodNotAllowed)
			return
		}

		user, err := extractUserFromToken(r, authService)
		if err != nil || user == nil {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		userID, _ := user.(map[string]interface{})["id"].(string)
		farm, err := service.GetFarmByOwnerID(userID)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(farm)
	})

	// @Summary Update farm profile
	// @Tags Farm
	// @Accept json
	// @Produce json
	// @Security BearerAuth
	// @Param farm body Farm true "Farm data"
	// @Success 200 {object} Farm
	// @Router /farm/profile [put]
	mux.HandleFunc("/farm/update", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPut {
			w.WriteHeader(http.StatusMethodNotAllowed)
			return
		}

		user, err := extractUserFromToken(r, authService)
		if err != nil || user == nil {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		var farm Farm
		if err := json.NewDecoder(r.Body).Decode(&farm); err != nil {
			http.Error(w, "Invalid request", http.StatusBadRequest)
			return
		}

		if err := service.UpdateFarm(farm.ID, farm.Name, farm.Type, farm.Location); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		userID, _ := user.(map[string]interface{})["id"].(string)
		updated, _ := service.GetFarmByOwnerID(userID)
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(updated)
	})
}

func extractUserFromToken(r *http.Request, authService AuthService) (interface{}, error) {
	authHeader := r.Header.Get("Authorization")
	if authHeader == "" {
		return nil, nil
	}

	parts := strings.Split(authHeader, " ")
	if len(parts) != 2 || parts[0] != "Bearer" {
		return nil, nil
	}

	return authService.ValidateToken(parts[1])
}
