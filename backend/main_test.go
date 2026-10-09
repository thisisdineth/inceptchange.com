package main

import (
	"encoding/json"
	"fmt"
	"io"
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

type emailTransport func(*http.Request) (*http.Response, error)

func (f emailTransport) RoundTrip(r *http.Request) (*http.Response, error) { return f(r) }
func TestEmailTemplatesEscapeCustomerContent(t *testing.T) {
	b := Brief{Name: `<script>alert("test")</script>`, Service: "Podcast & portraits", Touches: "Close-ups\nWide shots"}
	for _, customer := range []bool{false, true} {
		html, err := renderEmail(b, customer)
		if err != nil {
			t.Fatal(err)
		}
		if strings.Contains(html, "<script>") || !strings.Contains(html, "&lt;script&gt;") || !strings.Contains(html, "Podcast &amp; portraits") {
			t.Fatal("Customer content was not escaped")
		}
		if !strings.Contains(html, "not a confirmed booking") {
			t.Fatal("Missing booking status explanation")
		}
	}
}
func TestStudioAndCustomerCopies(t *testing.T) {
	for _, copyFails := range []bool{false, true} {
		t.Run(fmt.Sprint(copyFails), func(t *testing.T) {
			t.Setenv("RESEND_API_KEY", "test-key")
			original := client
			defer func() { client = original }()
			var calls []map[string]any
			client = &http.Client{Transport: emailTransport(func(r *http.Request) (*http.Response, error) {
				var payload map[string]any
				if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
					t.Fatal(err)
				}
				calls = append(calls, payload)
				status, body := 200, `{"id":"accepted"}`
				if copyFails && len(calls) == 2 {
					status = 429
					body = `{"message":"Rate limited"}`
				}
				return &http.Response{StatusCode: status, Body: io.NopCloser(strings.NewReader(body)), Header: make(http.Header)}, nil
			})}
			recorder := httptest.NewRecorder()
			submit(recorder, httptest.NewRequest("POST", "/", strings.NewReader(`{"brief":{"studio":true,"service":"Podcast show","date":"2026-12-01","location":"User changed venue","time":"4 pm","name":"Customer","email":"customer@example.com"}}`)))
			var result map[string]bool
			json.Unmarshal(recorder.Body.Bytes(), &result)
			if recorder.Code != 200 || !result["sent"] || result["customerCopySent"] == copyFails {
				t.Fatal("Incorrect submission result", recorder.Body.String())
			}
			if len(calls) != 2 {
				t.Fatalf("Expected two emails, got %d", len(calls))
			}
			if calls[0]["to"].([]any)[0] != "inceptchange@gmail.com" || calls[1]["to"].([]any)[0] != "customer@example.com" {
				t.Fatal("Wrong recipients")
			}
			if calls[0]["reply_to"] != "customer@example.com" || calls[1]["reply_to"] != "inceptchange@gmail.com" {
				t.Fatal("Wrong reply-to")
			}
			for _, payload := range calls {
				if !strings.Contains(payload["html"].(string), "IdeaBay") || payload["text"] == "" {
					t.Fatal("Missing fixed venue or plain text copy")
				}
			}
		})
	}
}
