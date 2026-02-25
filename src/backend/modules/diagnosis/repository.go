package diagnosis

import (
	"encoding/json"
	"os"
)

type DiagnosticRepository interface {
	LoadRules() ([]Rule, error)
}

type JSONRepository struct {
	FilePath string
}

func (r *JSONRepository) LoadRules() ([]Rule, error) {
	data, err := os.ReadFile(r.FilePath)
	if err != nil {
		return nil, err
	}

	var rules []Rule
	err = json.Unmarshal(data, &rules)
	return rules, err
}