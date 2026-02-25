package knowledge

import (
	"encoding/json"
	"os"
)

// Repository interface for testable code
type Repository interface {
	LoadGuidance() ([]Guidance, error)
}

// JSONRepository loads guidance from JSON file
type JSONRepository struct {
	FilePath string
}

func (r *JSONRepository) LoadGuidance() ([]Guidance, error) {
	data, err := os.ReadFile(r.FilePath)
	if err != nil {
		return nil, err
	}

	var guidance []Guidance
	err = json.Unmarshal(data, &guidance)
	return guidance, err
}
