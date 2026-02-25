package main

import (
	"net/http"

	"compositor/modules/knowledge"
	"compositor/modules/diagnosis"
	"compositor/modules/compost"
	"compositor/modules/reports"
	"compositor/modules/versioning"
	"compositor/modules/advisory"
)

func NewRouter() http.Handler {
	mux := http.NewServeMux()

	knowledge.RegisterRoutes(mux, "data/knowledge/rules.json")
	diagnosis.RegisterRoutes(mux, "data/diagnosis/rules.json")
	compost.RegisterRoutes(mux)
	reports.RegisterRoutes(mux)
	versioning.RegisterRoutes(mux)

	// advisory
	diagnosisRepo := &diagnosis.JSONRepository{FilePath: "data/diagnosis/rules.json"}
	diagnosisService, _ := diagnosis.NewDiagnosticService(diagnosisRepo)
	knowledgeRepo := &knowledge.JSONRepository{FilePath: "data/knowledge/rules.json"}
	knowledgeService, _ := knowledge.NewService(knowledgeRepo)

	aHandler := advisory.NewAdvisoryHandler(diagnosisService, knowledgeService)
	aHandler.RegisterRoutes(mux)

	return mux
}
