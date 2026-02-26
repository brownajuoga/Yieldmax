package main

import (
	"database/sql"
	"net/http"

	"compositor/modules/advisory"
	"compositor/modules/auth"
	"compositor/modules/compost"
	"compositor/modules/diagnosis"
	"compositor/modules/farm"
	"compositor/modules/knowledge"
	"compositor/modules/reports"
	"compositor/modules/versioning"
)

func NewRouter(db *sql.DB) http.Handler {
	mux := http.NewServeMux()

	// Initialize auth and farm services
	authRepo := auth.NewRepository(db)
	authService := auth.NewService(authRepo)
	farmRepo := farm.NewRepository(db)
	farmService := farm.NewService(farmRepo)
	reportsRepo := reports.NewInMemoryRepository()
	reportsService := reports.NewService(reportsRepo)

	// Register auth and farm routes
	auth.RegisterRoutes(mux, authService, farmService, reportsService)
	farm.RegisterRoutes(mux, farmService, authService)

	knowledge.RegisterRoutes(mux, "data/knowledge")
	diagnosis.RegisterRoutes(mux, "data/diagnosis")
	compost.RegisterRoutes(mux, "data/compost")
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
