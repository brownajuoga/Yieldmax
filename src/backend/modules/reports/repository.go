package reports

import (
	"encoding/json"
	"os"
	"sync"
)

type Repository interface {
	SaveReport(r FarmReport) error
	GetReportsByFarm(farmID string) ([]FarmReport, error)
	GetReportsByCrop(crop string) ([]FarmReport, error)
}

type InMemoryRepository struct {
	mu      sync.RWMutex
	reports []FarmReport
}

func NewInMemoryRepository() Repository {
	return &InMemoryRepository{
		reports: loadInitialReports(),
	}
}

func loadInitialReports() []FarmReport {
	data, err := os.ReadFile("data/reports/farm_reports.json")
	if err != nil {
		return []FarmReport{}
	}

	var reports []FarmReport
	json.Unmarshal(data, &reports)
	return reports
}

func (r *InMemoryRepository) SaveReport(report FarmReport) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.reports = append(r.reports, report)
	return nil
}

func (r *InMemoryRepository) GetReportsByFarm(farmID string) ([]FarmReport, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	var results []FarmReport
	for _, report := range r.reports {
		if report.FarmID == farmID {
			results = append(results, report)
		}
	}
	return results, nil
}

func (r *InMemoryRepository) GetReportsByCrop(crop string) ([]FarmReport, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	var results []FarmReport
	for _, report := range r.reports {
		if report.Crop == crop {
			results = append(results, report)
		}
	}
	return results, nil
}
