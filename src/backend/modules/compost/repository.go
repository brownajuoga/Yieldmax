package compost

import (
	"encoding/json"
	"os"
	"path/filepath"
	"sync"
	"time"
)

type Repository interface {
	LoadAll() ([]CompostMaterial, time.Time, error)
}

type JSONRepository struct {
	DirPath string

	mu            sync.RWMutex
	materials     []CompostMaterial
	latestVersion time.Time
	modTimes      map[string]time.Time
}

func (r *JSONRepository) LoadAll() ([]CompostMaterial, time.Time, error) {
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
		return r.materials, r.latestVersion, nil
	}

	var allMaterials []CompostMaterial
	var maxVersion time.Time
	newModTimes := make(map[string]time.Time)

	for _, file := range files {
		info, _ := os.Stat(file)
		newModTimes[file] = info.ModTime()

		data, err := os.ReadFile(file)
		if err != nil {
			continue
		}

		var set CompostSet
		if err := json.Unmarshal(data, &set); err != nil {
			continue
		}

		allMaterials = append(allMaterials, set.Materials...)
		if set.Version.After(maxVersion) {
			maxVersion = set.Version
		}
	}

	r.mu.Lock()
	r.materials = allMaterials
	r.latestVersion = maxVersion
	r.modTimes = newModTimes
	r.mu.Unlock()

	return allMaterials, maxVersion, nil
}
