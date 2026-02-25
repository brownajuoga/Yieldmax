package knowledge

type Service interface {
	GetGuidanceForCrop(crop string) ([]Guidance, error)
	GetGuidanceForNutrient(nutrient string) ([]Guidance, error)
}

type service struct {
	repo      Repository
	data      []Guidance
	cropIndex map[string][]Guidance
	nutrIndex map[string][]Guidance
}

func NewService(repo Repository) (Service, error) {
	data, _, err := repo.LoadAll()
	if err != nil {
		return nil, err
	}

	cropIndex := make(map[string][]Guidance)
	nutrIndex := make(map[string][]Guidance)

	for _, g := range data {
		cropIndex[g.Crop] = append(cropIndex[g.Crop], g)
		nutrIndex[g.Nutrient] = append(nutrIndex[g.Nutrient], g)
	}

	return &service{
		repo:      repo,
		data:      data,
		cropIndex: cropIndex,
		nutrIndex: nutrIndex,
	}, nil
}

func (s *service) GetGuidanceForCrop(crop string) ([]Guidance, error) {
	return s.cropIndex[crop], nil
}

func (s *service) GetGuidanceForNutrient(nutrient string) ([]Guidance, error) {
	return s.nutrIndex[nutrient], nil
}
