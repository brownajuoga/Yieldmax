package main

import (
	"log"
	"net/http"
)

func main() {
	router := NewRouter()

	log.Println("Server running on :9000")
	log.Fatal(http.ListenAndServe(":9000", router))
}
