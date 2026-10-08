package main

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

func TestProxyAuthentication(t *testing.T) {
	t.Setenv("ENQUIRY_PROXY_SECRET", "secret")
	called := false
	handler := protected(func(w http.ResponseWriter, r *http.Request) { called = true })
	r := httptest.NewRequest("POST", "/", strings.NewReader(`{}`))
	w := httptest.NewRecorder()
	handler(w, r)
	if w.Code != 403 || called {
		t.Fatal("Unauthenticated request reached handler")
	}
}
func TestMissingGeminiConfiguration(t *testing.T) {
	t.Setenv("GEMINI_API_KEY", "")
	w := httptest.NewRecorder()
	question(w, httptest.NewRequest("POST", "/", strings.NewReader(`{"step":"date","brief":{"service":"Wedding"}}`)))
	if w.Code != 503 {
		t.Fatalf("got %d", w.Code)
	}
}
func TestSubmissionRejectsInvalidEmail(t *testing.T) {
	w := httptest.NewRecorder()
	submit(w, httptest.NewRequest("POST", "/", strings.NewReader(`{"brief":{"service":"Wedding","date":"Undecided","location":"Colombo","time":"Undecided","name":"Customer","email":"bad"}}`)))
	if w.Code != 400 {
		t.Fatalf("got %d", w.Code)
	}
}
func TestNoFalseSuccessWithoutResend(t *testing.T) {
	t.Setenv("RESEND_API_KEY", "")
	w := httptest.NewRecorder()
	submit(w, httptest.NewRequest("POST", "/", strings.NewReader(`{"brief":{"service":"Wedding","date":"Undecided","location":"Colombo","time":"Undecided","name":"Customer","email":"customer@example.com"}}`)))
	if w.Code != 503 {
		t.Fatalf("got %d", w.Code)
	}
}
