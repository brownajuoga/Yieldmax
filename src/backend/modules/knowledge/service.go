package knowledge

type Service interface {
	GetGuidanceForCrop(crop string) ([]Guidance, error)
	GetGuidanceForNutrient(nutrient string) ([]Guidance, error)
}

type service struct {
	repo Repository
	data []Guidance
}

func NewService(repo Repository) (Service, error) {
	data, err := repo.LoadGuidance()
	if err != nil {
		return nil, err
	}
	return &service{repo: repo, data: data}, nil
}

// Filter by crop
func (s *service) GetGuidanceForCrop(crop string) ([]Guidance, error) {
	var results []Guidance
	for _, g := range s.data {
		if g.Crop == crop {
			results = append(results, g)
		}
	}
	return results, nil
}

// Filter by nutrient
func (s *service) GetGuidanceForNutrient(nutrient string) ([]Guidance, error) {
	var results []Guidance
	for _, g := range s.data {
		if g.Nutrient == nutrient {
			results = append(results, g)
		}
	}
	return results, nil
}
