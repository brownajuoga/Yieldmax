package diagnosis

import (
	"time"
)

type Service interface {
	Diagnose(req DiagnosisRequest) (*DiagnosisResult, error)
	CheckForUpdates(clientVersion time.Time) (*RuleSet, bool, error)
}

type service struct {
	repo      DiagnosisRepository
	rules     []Rule
	cropIndex map[string][]Rule
}

func NewDiagnosticService(repo DiagnosisRepository) (Service, error) {
	rules, _, err := repo.LoadAll()
	if err != nil {
		return nil, err
	}

	cropIndex := make(map[string][]Rule)
	for _, rule := range rules {
		cropIndex[rule.Crop] = append(cropIndex[rule.Crop], rule)
	}

	return &service{
		repo:      repo,
		rules:     rules,
		cropIndex: cropIndex,
	}, nil
}

func (s *service) Diagnose(req DiagnosisRequest) (*DiagnosisResult, error) {
	for _, rule := range s.cropIndex[req.Crop] {
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
	return nil, nil
}

func (s *service) CheckForUpdates(clientVersion time.Time) (*RuleSet, bool, error) {
	rules, version, err := s.repo.LoadAll()
	if err != nil {
		return nil, false, err
	}

	s.rules = rules
	s.cropIndex = make(map[string][]Rule)
	for _, rule := range rules {
		s.cropIndex[rule.Crop] = append(s.cropIndex[rule.Crop], rule)
	}

	serverVersion := version.Truncate(time.Second)
	clientVersion = clientVersion.Truncate(time.Second)

	if serverVersion.After(clientVersion) {
		return &RuleSet{Version: version, Rules: rules}, true, nil
	}

	return nil, false, nil
}
