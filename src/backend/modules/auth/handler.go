package auth

import (
	"encoding/json"
	"net/http"
	"strings"
)

type FarmService interface {
	CreateFarm(name, farmType, location, ownerID string) (interface{}, error)
	GetFarmByOwnerID(ownerID string) (interface{}, error)
}

type ReportsService interface {
	ListReportsByFarm(farmID string) ([]interface{}, error)
}

func RegisterRoutes(mux *http.ServeMux, authService Service, farmService FarmService, reportsService ReportsService) {
	// @Summary Register new user and farm
	// @Tags Auth
	// @Accept json
	// @Produce json
	// @Param register body RegisterRequest true "Registration data"
	// @Success 201 {object} AuthResponse
	// @Router /auth/register [post]
	mux.HandleFunc("/auth/register", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			w.WriteHeader(http.StatusMethodNotAllowed)
			return
		}

		var req RegisterRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "Invalid request", http.StatusBadRequest)
			return
		}

		user, err := authService.Register(req.Email, req.Password, req.Name)
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		farmData, err := farmService.CreateFarm(req.Farm.Name, req.Farm.Type, req.Farm.Location, user.ID)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		token, _, err := authService.Login(req.Email, req.Password)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(AuthResponse{
			Token:   token,
			User:    *user,
			Farm:    farmData,
			Reports: []interface{}{},
		})
	})

	// @Summary Login and get offline package
	// @Tags Auth
	// @Accept json
	// @Produce json
	// @Param login body LoginRequest true "Login credentials"
	// @Success 200 {object} AuthResponse
	// @Router /auth/login [post]
	mux.HandleFunc("/auth/login", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			w.WriteHeader(http.StatusMethodNotAllowed)
			return
		}

		var req LoginRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "Invalid request", http.StatusBadRequest)
			return
		}

		token, user, err := authService.Login(req.Email, req.Password)
		if err != nil {
			http.Error(w, err.Error(), http.StatusUnauthorized)
			return
		}

		farmData, _ := farmService.GetFarmByOwnerID(user.ID)
		userReports, _ := reportsService.ListReportsByFarm("")

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(AuthResponse{
			Token:   token,
			User:    *user,
			Farm:    farmData,
			Reports: userReports,
		})
	})
}

func ExtractUserFromToken(r *http.Request, authService Service) (*User, error) {
	authHeader := r.Header.Get("Authorization")
	if authHeader == "" {
		return nil, nil
	}

	parts := strings.Split(authHeader, " ")
	if len(parts) != 2 || parts[0] != "Bearer" {
		return nil, nil
	}

	userData, err := authService.ValidateToken(parts[1])
	if err != nil {
		return nil, err
	}

	userMap, ok := userData.(map[string]interface{})
	if !ok {
		return nil, nil
	}

	return &User{
		ID:    userMap["id"].(string),
		Email: userMap["email"].(string),
		Name:  userMap["name"].(string),
	}, nil
}
