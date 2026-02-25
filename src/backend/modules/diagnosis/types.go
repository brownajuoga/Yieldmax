package diagnosis

import "time"

type DiagnosisRequest struct {
	Crop     string `json:"crop"`
	Symptom  string `json:"symptom"`
}

type DiagnosisResult struct {
	Nutrient   string   `json:"nutrient"`
	Confidence float64  `json:"confidence"`
	Actions    []string `json:"actions"`
}

type Rule struct {
	Crop     string   `json:"crop"`
	Symptoms []string `json:"symptoms"`
	Nutrient string   `json:"nutrient"`
	Actions  []string `json:"actions"`
}

type RuleSet struct {
	Version time.Time `json:"version"`
	Rules   []Rule    `json:"rules"`
}