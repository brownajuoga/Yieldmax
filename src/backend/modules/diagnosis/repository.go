package diagnosis

import (
	"encoding/json"
	"os"
	"path/filepath"
	"sync"
	"time"
)

type DiagnosisRepository interface {
	LoadAll() ([]Rule, time.Time, error)
	GetVersion() (time.Time, error)
	IsNewerThan(clientVersion time.Time) (bool, error)
}

type JSONRepository struct {
	DirPath string

	mu            sync.RWMutex
	rules         []Rule
	latestVersion time.Time
	modTimes      map[string]time.Time
}

func (r *JSONRepository) LoadAll() ([]Rule, time.Time, error) {
	files, err := filepath.Glob(filepath.Join(r.DirPath, "*.json"))
	if err != nil {
		return nil, time.Time{}, err
	}

	needReload := false
	r.mu.RLock()
	if r.modTimes == nil {
		needReload = true
	} else {
		for _, file := range files {
			info, err := os.Stat(file)
			if err != nil || !info.ModTime().Equal(r.modTimes[file]) {
				needReload = true
				break
			}
		}
	}
	r.mu.RUnlock()

	if !needReload {
		r.mu.RLock()
		defer r.mu.RUnlock()
		return r.rules, r.latestVersion, nil
	}

	var allRules []Rule
	var maxVersion time.Time
	newModTimes := make(map[string]time.Time)

	for _, file := range files {
		info, _ := os.Stat(file)
		newModTimes[file] = info.ModTime()

		data, err := os.ReadFile(file)
		if err != nil {
			continue
		}

		var set RuleSet
		if err := json.Unmarshal(data, &set); err != nil {
			continue
		}

		allRules = append(allRules, set.Rules...)
		if set.Version.After(maxVersion) {
			maxVersion = set.Version
		}
	}

	r.mu.Lock()
	r.rules = allRules
	r.latestVersion = maxVersion
	r.modTimes = newModTimes
	r.mu.Unlock()

	return allRules, maxVersion, nil
}

func (r *JSONRepository) GetVersion() (time.Time, error) {
	_, version, err := r.LoadAll()
	return version, err
}

func (r *JSONRepository) IsNewerThan(clientVersion time.Time) (bool, error) {
	serverVersion, err := r.GetVersion()
	if err != nil {
		return false, err
	}

	serverVersion = serverVersion.Truncate(time.Second)
	clientVersion = clientVersion.Truncate(time.Second)

	return serverVersion.After(clientVersion), nil
}
