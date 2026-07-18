package selenoid

import (
	"context"
	"encoding/json"
	. "github.com/aandryashin/matchers"
	"net/http"
	"net/http/httptest"
	"net/url"
	"testing"
)

func mockStatusApi() http.Handler {
	mux := http.NewServeMux()
	mux.HandleFunc(statusPath, mockStatus)
	return mux
}

func mockStatus(w http.ResponseWriter, _ *http.Request) {
	data, _ := json.MarshalIndent(selenoidState(), "", " ")
	w.WriteHeader(http.StatusOK)
	w.Write(data)
}

func selenoidState() State {
	var state State
	json.Unmarshal([]byte(`{
  "total": 20,
  "used": 2,
  "queued": 0,
  "pending": 0,
  "browsers": {
    "chrome": {
      "58.0": {
        "unknown": {
          "count": 1,
          "sessions": [
            {
              "id": "5ad7e24dd38f7283163d839cae5e7e70",
              "vnc": false,
              "screen": "1920x1080x24",
              "caps": {
                "browserName": "firefox",
                "version": "46",
                "screenResolution": "1920x1080x24",
                "enableVNC": true,
                "name": "",
                "timeZone": ""
              }
            }
          ]
        }
      }
    },
    "firefox": {
      "52.0": {
        "unknown": {
          "count": 1,
          "sessions": [
            {
              "id": "87cffbdd-8b63-46a5-ba65-6f2d32d40304",
              "vnc": false,
              "screen": "1920x1080x24",
              "caps": {
                "browserName": "firefox",
                "version": "46",
                "screenResolution": "1920x1080x24",
                "enableVNC": true,
                "name": "",
                "timeZone": ""
              }
            }
          ]
        }
      }
    },
    "opera": {
      "44.0": {}
    }
  },
	"videos":["test_chrome.mp4"]
}`), &state)
	return state
}

func TestToUI(t *testing.T) {
	t.Run("To UI", func(t *testing.T) {
		statusURI, _ := url.Parse("http://localhost")
		ui := toUI(selenoidState(), statusURI, "version", nil, "")
		data, err := json.MarshalIndent(ui, "", " ")
		AssertThat(t, err, Is{nil})
		AssertThat(t, data, Is{Not{nil}})
		AssertThat(t, ui.Browsers["firefox"], Is{1})
		AssertThat(t, ui.Browsers["chrome"], Is{1})
		AssertThat(t, ui.Browsers["opera"], Is{0})
	})
}

func TestStatus(t *testing.T) {
	t.Run("Status", func(t *testing.T) {
		srv := httptest.NewServer(mockStatusApi())
		statusURI, _ := url.Parse(srv.URL)
		webdriverURI := statusURI // Any value will work for this test
		data, err := Status(context.Background(), webdriverURI, statusURI, "version", nil, "qa_engineer:aAb_-4gs53FD")
		AssertThat(t, err, Is{nil})
		AssertThat(t, data, Not{nil})
		var payload map[string]interface{}
		AssertThat(t, json.Unmarshal(data, &payload), Is{nil})
		AssertThat(t, payload["playwrightAccessKey"], Is{"qa_engineer:aAb_-4gs53FD"})
		state, ok := payload["state"].(map[string]interface{})
		AssertThat(t, ok, Is{true})
		videos, ok := state["videos"].([]interface{})
		AssertThat(t, ok, Is{true})
		AssertThat(t, len(videos), Is{0})
	})
}

func TestStatusDoesNotFetchVideoList(t *testing.T) {
	t.Run("Status does not request /video", func(t *testing.T) {
		videoHits := 0
		mux := http.NewServeMux()
		mux.HandleFunc("/status", mockStatus)
		mux.HandleFunc("/video", func(w http.ResponseWriter, r *http.Request) {
			videoHits++
			w.WriteHeader(http.StatusOK)
			_, _ = w.Write([]byte(`{"videos":["should-not-load.mp4"],"total":1,"limit":10,"offset":0}`))
		})
		mux.HandleFunc("/video/", func(w http.ResponseWriter, r *http.Request) {
			videoHits++
			w.WriteHeader(http.StatusOK)
			_, _ = w.Write([]byte(`{"videos":["should-not-load.mp4"],"total":1,"limit":10,"offset":0}`))
		})
		srv := httptest.NewServer(mux)
		defer srv.Close()
		statusURI, _ := url.Parse(srv.URL)
		data, err := Status(context.Background(), statusURI, statusURI, "version", nil, "")
		AssertThat(t, err, Is{nil})
		AssertThat(t, data, Not{nil})
		AssertThat(t, videoHits, Is{0})
	})
}
