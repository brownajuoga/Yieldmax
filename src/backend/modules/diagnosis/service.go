package diagnosis

import (
	"time"
)

// Service defines the behavior of the diagnostic engine
type Service interface {
	// Diagnose returns a nutrient deficiency and recommended actions based on crop and symptom
	Diagnose(req DiagnosisRequest) (*DiagnosisResult, error)
	// CheckForUpdates compares the client's last version with server version and returns updated RuleSet if newer
	CheckForUpdates(clientVersion time.Time) (*RuleSet, bool, error)
}

// service is the concrete implementation
type service struct {
	repo    DiagnosisRepository
	ruleset *RuleSet
}

// NewDiagnosticService initializes the service with the latest RuleSet from the repository
func NewDiagnosticService(repo DiagnosisRepository) (Service, error) {
	rs, err := repo.LoadRuleSet()
	if err != nil {
		return nil, err
	}

	return &service{
		repo:    repo,
		ruleset: rs,
	}, nil
}

// Diagnose searches the RuleSet for a matching crop + symptom and returns a nutrient recommendation
func (s *service) Diagnose(req DiagnosisRequest) (*DiagnosisResult, error) {
	for _, rule := range s.ruleset.Rules {
		if rule.Crop == req.Crop {
			for _, symptom := range rule.Symptoms {
				if symptom == req.Symptom {
					return &DiagnosisResult{
						Nutrient:   rule.Nutrient,
						Confidence: 0.9,
						Actions:    rule.Actions,
					}, nil
				}
			}
		}
	}
	return nil, nil
}

// CheckForUpdates compares the client version with the server version and returns the latest RuleSet if newer
func (s *service) CheckForUpdates(clientVersion time.Time) (*RuleSet, bool, error) {
    // always reload from repo
    latestRules, err := s.repo.LoadRuleSet()
    if err != nil {
        return nil, false, err
    }

    s.ruleset = latestRules // update in-memory copy

    if latestRules.Version.After(clientVersion) {
        return latestRules, true, nil
    }
    return nil, false, nil
}
