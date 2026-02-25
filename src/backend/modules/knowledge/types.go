package knowledge

import "time"

type Guidance struct {
	Crop           string   `json:"crop"`
	Nutrient       string   `json:"nutrient"`
	Sources        []string `json:"sources"`
	Preparation    string   `json:"preparation"`
	Application    string   `json:"application"`
	Notes          string   `json:"notes,omitempty"`
}

type KnowledgeSet struct {
	Version time.Time `json:"version"`
	Entries []Guidance `json:"entries"`
}