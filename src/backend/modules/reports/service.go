package reports

var reports []FieldReport

func Submit(report FieldReport) {
	reports = append(reports, report)
}

func GetAll() []FieldReport {
	return reports
}