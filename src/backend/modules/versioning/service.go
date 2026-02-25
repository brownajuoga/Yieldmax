package versioning

type Service interface {
	GetVersion(module string) (ModuleVersion, error)
	UpdateVersion(v ModuleVersion) error
	ListAllVersions() ([]ModuleVersion, error)
}

type service struct {
	repo Repository
}

func NewService(repo Repository) Service {
	return &service{repo: repo}
}

func (s *service) GetVersion(module string) (ModuleVersion, error) {
	return s.repo.GetModuleVersion(module)
}

func (s *service) UpdateVersion(v ModuleVersion) error {
	return s.repo.SetModuleVersion(v)
}

func (s *service) ListAllVersions() ([]ModuleVersion, error) {
	return s.repo.ListVersions()
}
