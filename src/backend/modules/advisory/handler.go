package advisory

import (
	"encoding/json"
	"net/http"
	"compositor/modules/diagnosis"
	"compositor/modules/knowledge"
)

type AdvisoryHandler struct {
	diagnosisService diagnosis.Service
	knowledgeService knowledge.Service
}

func NewAdvisoryHandler(dService diagnosis.Service, kService knowledge.Service) *AdvisoryHandler {
	return &AdvisoryHandler{
		diagnosisService: dService,
		knowledgeService: kService,
	}
}

func (h *AdvisoryHandler) RegisterRoutes(mux *http.ServeMux) {
	mux.HandleFunc("/advisory", h.handleAdvisory)
}

func (h *AdvisoryHandler) handleAdvisory(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req diagnosis.DiagnosisRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request: "+err.Error(), http.StatusBadRequest)
		return
	}

	// Step 1: Diagnose nutrient deficiency
	diagResult, err := h.diagnosisService.Diagnose(req)
	if err != nil {
		http.Error(w, "Diagnosis error: "+err.Error(), http.StatusInternalServerError)
		return
	}
	if diagResult == nil {
		http.Error(w, "No matching diagnosis found", http.StatusNotFound)
		return
	}

	// Step 2: Fetch guidance from knowledge engine
	guidance, err := h.knowledgeService.GetGuidanceForNutrient(diagResult.Nutrient)
	if err != nil {
		http.Error(w, "Knowledge retrieval error: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Step 3: Build combined response
	type AdvisoryResponse struct {
		Diagnosis diagnosis.DiagnosisResult `json:"diagnosis"`
		Guidance  []knowledge.Guidance     `json:"guidance"`
	}

	resp := AdvisoryResponse{
		Diagnosis: *diagResult,
		Guidance:  guidance,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
