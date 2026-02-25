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

	knowledge.RegisterRoutes(mux, "data/knowledge")
	diagnosis.RegisterRoutes(mux, "data/diagnosis")
	compost.RegisterRoutes(mux)
	reports.RegisterRoutes(mux)
	versioning.RegisterRoutes(mux)

	// advisory
	diagnosisRepo := &diagnosis.JSONRepository{DirPath: "data/diagnosis"}
	diagnosisService, _ := diagnosis.NewDiagnosticService(diagnosisRepo)
	knowledgeRepo := &knowledge.JSONRepository{DirPath: "data/knowledge"}
	knowledgeService, _ := knowledge.NewService(knowledgeRepo)

	aHandler := advisory.NewAdvisoryHandler(diagnosisService, knowledgeService)
	aHandler.RegisterRoutes(mux)

	return mux
}
