package reports

type FieldReport struct {
	Crop   string  `json:"crop"`
	Region string  `json:"region"`
	Yield  float64 `json:"yield"`
}