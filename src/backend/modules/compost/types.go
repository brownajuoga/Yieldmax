package compost

type CompostRequest struct {
	Goal    string   `json:"goal"`
	Sources []string `json:"sources"`
}

type CompostPlan struct {
	Mix  string `json:"mix"`
	Note string `json:"note"`
}