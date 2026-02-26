package reports

type Service interface {
	RecordReport(r FarmReport) error
	ListReportsByFarm(farmID string) ([]interface{}, error)
	ListReportsByCrop(crop string) ([]FarmReport, error)
}

type service struct {
	repo Repository
}

func NewService(repo Repository) Service {
	return &service{repo: repo}
}

func (s *service) RecordReport(r FarmReport) error {
	return s.repo.SaveReport(r)
}

func (s *service) ListReportsByFarm(farmID string) ([]interface{}, error) {
	return s.repo.ListReportsByFarm(farmID)
}

func (s *service) ListReportsByCrop(crop string) ([]FarmReport, error) {
	return s.repo.GetReportsByCrop(crop)
}
