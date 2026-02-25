package compost

import "time"

type CompostMaterial struct {
	Material        string             `json:"material"`
	NutrientContent map[string]float64 `json:"nutrient_content"`
	Preparation     string             `json:"preparation"`
	Application     string             `json:"application"`
	Notes           string             `json:"notes,omitempty"`
}

type CompostSet struct {
	Version   time.Time         `json:"version"`
	Materials []CompostMaterial `json:"materials"`
}
