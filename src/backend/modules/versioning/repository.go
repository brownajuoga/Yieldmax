package versioning

import "sync"

type Repository interface {
	GetModuleVersion(module string) (ModuleVersion, error)
	SetModuleVersion(v ModuleVersion) error
	ListVersions() ([]ModuleVersion, error)
}

type InMemoryRepository struct {
	mu       sync.RWMutex
	versions map[string]ModuleVersion
}

func NewInMemoryRepository() Repository {
	return &InMemoryRepository{
		versions: make(map[string]ModuleVersion),
	}
}

func (r *InMemoryRepository) GetModuleVersion(module string) (ModuleVersion, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	return r.versions[module], nil
}

func (r *InMemoryRepository) SetModuleVersion(v ModuleVersion) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.versions[v.Module] = v
	return nil
}

func (r *InMemoryRepository) ListVersions() ([]ModuleVersion, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	var results []ModuleVersion
	for _, v := range r.versions {
		results = append(results, v)
	}
	return results, nil
}
