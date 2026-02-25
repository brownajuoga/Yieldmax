package knowledge

type Nutrient struct {
	Name   string `json:"name"`   // e.g., Nitrogen
	Symbol string `json:"symbol"` // e.g., N
}

type Crop struct {
	Name string `json:"name"` // e.g., Maize
}

type OrganicSource struct {
	Name        string `json:"name"`        // e.g., Banana Peels
	Description string `json:"description"` // optional details
}

type Guidance struct {
	Crop           string   `json:"crop"`           // target crop
	Nutrient       string   `json:"nutrient"`       // e.g., Nitrogen
	Sources        []string `json:"sources"`        // recommended organic sources
	Preparation    string   `json:"preparation"`    // e.g., 1:1 banana peels + dry leaves
	Application    string   `json:"application"`    // e.g., apply 3t/acre 30 days before planting
	Notes          string   `json:"notes,omitempty"`// optional advice
}