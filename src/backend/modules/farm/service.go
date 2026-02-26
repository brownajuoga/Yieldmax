package farm

type Service interface {
	CreateFarm(name, farmType, location, ownerID string) (interface{}, error)
	GetFarmByOwnerID(ownerID string) (interface{}, error)
	GetFarmsByOwnerID(ownerID string) ([]interface{}, error)
	UpdateFarm(id, name, farmType, location string) error
}

type service struct {
	repo Repository
}

func NewService(repo Repository) Service {
	return &service{repo: repo}
}

func (s *service) CreateFarm(name, farmType, location, ownerID string) (interface{}, error) {
	return s.repo.CreateFarm(name, farmType, location, ownerID)
}

func (s *service) GetFarmByOwnerID(ownerID string) (interface{}, error) {
	return s.repo.GetFarmByOwnerID(ownerID)
}

func (s *service) GetFarmsByOwnerID(ownerID string) ([]interface{}, error) {
	farms, err := s.repo.GetFarmsByOwnerID(ownerID)
	if err != nil {
		return nil, err
	}
	result := make([]interface{}, len(farms))
	for i, farm := range farms {
		result[i] = farm
	}
	return result, nil
}
func (s *service) UpdateFarm(id, name, farmType, location string) error {
	return s.repo.UpdateFarm(id, name, farmType, location)
}