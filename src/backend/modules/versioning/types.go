package versioning

import "time"

type ModuleVersion struct {
	Module  string    `json:"module"`
	Version time.Time `json:"version"`
	Files   []string  `json:"files"`
}
