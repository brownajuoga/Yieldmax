package reports

import "time"

type FarmReport struct {
	FarmID       string    `json:"farm_id"`
	Crop         string    `json:"crop"`
	ActionsTaken []string  `json:"actions_taken"`
	YieldBefore  float64   `json:"yield_before"`
	YieldAfter   float64   `json:"yield_after"`
	Date         time.Time `json:"date"`
}
