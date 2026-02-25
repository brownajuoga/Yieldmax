package diagnosis

type Service interface {
	Diagnose(req DiagnosisRequest) (*DiagnosisResult, error)
}

type service struct {
	repo DiagnosticRepository
	rules []Rule
}

func NewDiagnosticService(repo DiagnosticRepository) (Service, error) {
	rules, err := repo.LoadRules()
	if err != nil {
		return nil, err
	}

	return &service{
		repo: repo,
		rules: rules,
	}, nil
}

func (s *service) Diagnose(req DiagnosisRequest) (*DiagnosisResult, error) {
	for _, rule := range s.rules {
		if rule.Crop == req.Crop {
			for _, symptom := range rule.Symptoms {
				if symptom == req.Symptom {
					return &DiagnosisResult{
						Nutrient: rule.Nutrient,
						Confidence: 0.9,
						Actions: rule.Actions,
					}, nil
				}
			}
		}
	}

	return nil, nil
}