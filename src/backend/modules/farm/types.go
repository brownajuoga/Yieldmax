package farm

import "time"

type Farm struct {
	ID        string    `json:"id"`
	Name      string    `json:"name" example:"Green Valley Farm"`
	Type      string    `json:"type" example:"Mixed Livestock"`
	Location  string    `json:"location" example:"Nakuru, Rift Valley"`
	OwnerID   string    `json:"owner_id"`
	CreatedAt time.Time `json:"created_at"`
}
