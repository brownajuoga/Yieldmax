package auth

import "time"

type User struct {
	ID        string    `json:"id"`
	Email     string    `json:"email"`
	Password  string    `json:"-"`
	Name      string    `json:"name"`
	CreatedAt time.Time `json:"created_at"`
}

type RegisterRequest struct {
	Email    string `json:"email" example:"farmer@example.com"`
	Password string `json:"password" example:"password123"`
	Name     string `json:"name" example:"John Kamau"`
	Farm     FarmData `json:"farm"`
}

type FarmData struct {
	Name     string `json:"name" example:"Green Valley Farm"`
	Type     string `json:"type" example:"Mixed Livestock"`
	Location string `json:"location" example:"Nakuru, Rift Valley"`
}

type LoginRequest struct {
	Email    string `json:"email" example:"farmer@example.com"`
	Password string `json:"password" example:"password123"`
}

type AuthResponse struct {
	Token   string      `json:"token"`
	User    User        `json:"user"`
	Farm    interface{} `json:"farm"`
	Reports []interface{} `json:"reports"`
}
