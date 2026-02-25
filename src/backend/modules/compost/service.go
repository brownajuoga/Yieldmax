package compost

type Service interface {
	ListMaterials() ([]CompostMaterial, error)
	GetMaterial(name string) (*CompostMaterial, error)
}

type service struct {
	repo          Repository
	materials     []CompostMaterial
	materialIndex map[string]*CompostMaterial
}

func NewService(repo Repository) (Service, error) {
	materials, _, err := repo.LoadAll()
	if err != nil {
		return nil, err
	}

	materialIndex := make(map[string]*CompostMaterial)
	for i := range materials {
		materialIndex[materials[i].Material] = &materials[i]
	}

	return &service{
		repo:          repo,
		materials:     materials,
		materialIndex: materialIndex,
	}, nil
}

func (s *service) ListMaterials() ([]CompostMaterial, error) {
	return s.materials, nil
}

func (s *service) GetMaterial(name string) (*CompostMaterial, error) {
	return s.materialIndex[name], nil
}
