package diagnosis

import (
	"encoding/json"
	"os"
	"sync"
	"time"
)

// DiagnosisRepository defines repository interface
type DiagnosisRepository interface {
	LoadRuleSet() (*RuleSet, error)
	GetVersion() (time.Time, error)
	IsNewerThan(clientVersion time.Time) (bool, error)
}

// JSONRepository implements DiagnosisRepository
type JSONRepository struct {
	FilePath string
	cache    *RuleSet
	mu       sync.RWMutex
}

// LoadRuleSet reloads from JSON file
func (r *JSONRepository) LoadRuleSet() (*RuleSet, error) {
	data, err := os.ReadFile(r.FilePath)
	if err != nil {
		return nil, err
	}

	var ruleset RuleSet
	if err := json.Unmarshal(data, &ruleset); err != nil {
		return nil, err
	}

	// Parse version string as RFC3339 timestamp
	t, err := time.Parse(time.RFC3339, ruleset.VersionStr)
	if err != nil {
		return nil, err
	}
	ruleset.Version = t

	r.mu.Lock()
	r.cache = &ruleset
	r.mu.Unlock()

	return &ruleset, nil
}

// GetVersion returns current RuleSet version
func (r *JSONRepository) GetVersion() (time.Time, error) {
	r.mu.RLock()
	if r.cache != nil {
		defer r.mu.RUnlock()
		return r.cache.Version, nil
	}
	r.mu.RUnlock()
	rs, err := r.LoadRuleSet()
	if err != nil {
		return time.Time{}, err
	}
	return rs.Version, nil
}

// IsNewerThan compares server version to client version
func (r *JSONRepository) IsNewerThan(clientVersion time.Time) (bool, error) {
	serverVersion, err := r.GetVersion()
	if err != nil {
		return false, err
	}

	// Truncate to second to ignore milliseconds/nanoseconds
	return serverVersion.Truncate(time.Second).After(clientVersion.Truncate(time.Second)), nil
}
