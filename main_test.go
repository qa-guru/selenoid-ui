package main

import (
	"encoding/json"
	"io"
	"net/http"
	"net/http/httptest"
	"net/url"
	"os"
	"path/filepath"
	"strings"
	"testing"

	. "github.com/aandryashin/matchers"
	. "github.com/aandryashin/matchers/httpresp"
	"github.com/aerokube/selenoid-ui/selenoid"
	"github.com/aerokube/util/sse"
	"github.com/koding/websocketproxy"
)

var (
	srv *httptest.Server
)

var _ = func() bool {
	testing.Init()
	return true
}()

func init() {
	broker := sse.NewSseBroker()
	srv = httptest.NewServer(mux(broker))
	gitRevision = "test-revision"
}

func selenoidApi() http.Handler {
	mux := http.NewServeMux()
	mux.HandleFunc("/status", mockStatus)
	return mux
}

func mockStatus(w http.ResponseWriter, _ *http.Request) {
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{
  "total": 5,
  "used": 0,
  "queued": 0,
  "pending": 0,
  "browsers": {
    "firefox": {
      "61.0": {}
    }
  },
  "videos":["test_chrome.mp4"]
}`))
}

func videoApi() http.Handler {
	mux := http.NewServeMux()
	mux.HandleFunc("/video/", mockVideo)
	return mux
}

func mockVideo(w http.ResponseWriter, _ *http.Request) {
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("im a video"))
}

func withUrl(path string) string {
	return srv.URL + path
}

func saveBrowserProtocols() selenoid.BrowserProtocols {
	prev := browserProtocols
	return prev
}

func restoreBrowserProtocols(prev selenoid.BrowserProtocols) {
	browserProtocols = prev
}

func TestRootLoads(t *testing.T) {
	t.Run("Root loads", func(t *testing.T) {
		resp, err := http.Get(withUrl("/"))
		AssertThat(t, err, Is{nil})
		AssertThat(t, resp, Code{200})
	})
}

func TestPing(t *testing.T) {
	t.Run("Ping", func(t *testing.T) {
		rsp, err := http.Get(withUrl("/ping"))

		AssertThat(t, err, Is{nil})
		AssertThat(t, rsp, Code{http.StatusOK})
		AssertThat(t, rsp.Body, Is{Not{nil}})

		var data map[string]interface{}
		bt, readErr := io.ReadAll(rsp.Body)
		AssertThat(t, readErr, Is{nil})
		jsonErr := json.Unmarshal(bt, &data)
		AssertThat(t, jsonErr, Is{nil})
		_, hasUptime := data["uptime"]
		AssertThat(t, hasUptime, Is{true})
		version, hasVersion := data["version"]
		AssertThat(t, hasVersion, Is{true})
		AssertThat(t, version, EqualTo{"test-revision"})
	})
}

func TestStatus(t *testing.T) {
	t.Run("Status", func(t *testing.T) {
		selenoidSrv := httptest.NewServer(selenoidApi())
		defer selenoidSrv.Close()
		statusURI, _ = url.Parse(selenoidSrv.URL)
		rsp, err := http.Get(withUrl("/status"))

		AssertThat(t, err, Is{nil})
		AssertThat(t, rsp, Code{http.StatusOK})
		AssertThat(t, rsp.Body, Is{Not{nil}})
		AssertThat(t, rsp.Header.Get("Content-Type"), Is{"application/json"})
	})
}

func TestBrowsersConfig(t *testing.T) {
	prev := saveBrowserProtocols()
	defer restoreBrowserProtocols(prev)

	t.Run("Empty map when no config loaded", func(t *testing.T) {
		browserProtocols = nil
		rsp, err := http.Get(withUrl("/browsers-config"))
		AssertThat(t, err, Is{nil})
		AssertThat(t, rsp, Code{http.StatusOK})
		AssertThat(t, rsp.Header.Get("Content-Type"), Is{"application/json"})

		var data map[string]interface{}
		bt, readErr := io.ReadAll(rsp.Body)
		AssertThat(t, readErr, Is{nil})
		AssertThat(t, json.Unmarshal(bt, &data), Is{nil})
		AssertThat(t, len(data), Is{0})
	})

	t.Run("Returns protocol metadata", func(t *testing.T) {
		browserProtocols = selenoid.BrowserProtocols{
			"playwright-chromium": {
				"1.61.1": {Protocol: "playwright"},
			},
			"chrome": {
				"148.0": {Protocol: "webdriver"},
			},
		}

		rsp, err := http.Get(withUrl("/browsers-config"))
		AssertThat(t, err, Is{nil})
		AssertThat(t, rsp, Code{http.StatusOK})

		var data map[string]map[string]map[string]string
		bt, readErr := io.ReadAll(rsp.Body)
		AssertThat(t, readErr, Is{nil})
		AssertThat(t, json.Unmarshal(bt, &data), Is{nil})
		AssertThat(t, data["playwright-chromium"]["1.61.1"]["protocol"], EqualTo{"playwright"})
		AssertThat(t, data["chrome"]["148.0"]["protocol"], EqualTo{"webdriver"})
	})
}

func TestVideo(t *testing.T) {
	t.Run("Video", func(t *testing.T) {
		video := httptest.NewServer(videoApi())
		defer video.Close()
		statusURI, _ = url.Parse(video.URL)
		rsp, err := http.Get(withUrl("/video/test_chrome.mp4"))

		AssertThat(t, err, Is{nil})
		AssertThat(t, rsp, Code{http.StatusOK})
		AssertThat(t, rsp.Body, Is{Not{nil}})
	})
}

func TestVideoFail(t *testing.T) {
	t.Run("Video fail", func(t *testing.T) {
		statusURI, _ = url.Parse("http://127.0.0.1:1")
		rsp, err := http.Get(withUrl("/video/test_chrome1.mp4"))

		AssertThat(t, err, Is{nil})
		AssertThat(t, rsp, Code{http.StatusBadGateway})
		AssertThat(t, rsp.Body, Not{Is{nil}})
	})
}

func TestPlaywrightProxyHubDown(t *testing.T) {
	t.Run("Playwright proxy error when hub unreachable", func(t *testing.T) {
		statusURI, _ = url.Parse("http://127.0.0.1:1")
		rsp, err := wsUpgradeGet(withUrl("/playwright/playwright-chromium/1.61.1"))

		AssertThat(t, err, Is{nil})
		AssertThat(t, rsp.StatusCode >= http.StatusBadGateway, Is{true})
	})
}

func wsUpgradeGet(url string) (*http.Response, error) {
	req, err := http.NewRequest(http.MethodGet, url, nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("Connection", "Upgrade")
	req.Header.Set("Upgrade", "websocket")
	req.Header.Set("Sec-WebSocket-Version", "13")
	req.Header.Set("Sec-WebSocket-Key", "dGhlIHNhbXBsZSBub25jZQ==")
	return http.DefaultClient.Do(req)
}

func TestWsProxyHubDown(t *testing.T) {
	t.Run("VNC ws proxy error when hub unreachable", func(t *testing.T) {
		statusURI, _ = url.Parse("http://127.0.0.1:1")
		rsp, err := wsUpgradeGet(withUrl("/ws/vnc/abc"))

		AssertThat(t, err, Is{nil})
		AssertThat(t, rsp.StatusCode >= http.StatusBadGateway, Is{true})
	})
}

func TestWsProxyRejectsPlainGet(t *testing.T) {
	t.Run("Plain GET without upgrade returns 400", func(t *testing.T) {
		selenoidSrv := httptest.NewServer(selenoidApi())
		defer selenoidSrv.Close()
		statusURI, _ = url.Parse(selenoidSrv.URL)

		for _, path := range []string{"/ws/vnc/abc", "/ws/logs/abc"} {
			rsp, err := http.Get(withUrl(path))
			AssertThat(t, err, Is{nil})
			AssertThat(t, rsp, Code{http.StatusBadRequest})
			body, readErr := io.ReadAll(rsp.Body)
			AssertThat(t, readErr, Is{nil})
			AssertThat(t, strings.Contains(string(body), "websocket"), Is{true})
		}
	})
}

func TestStatusError(t *testing.T) {
	t.Run("Status error", func(t *testing.T) {
		statusURI, _ = url.Parse("http://127.0.0.1:1")
		rsp, err := http.Get(withUrl("/status"))

		AssertThat(t, err, Is{nil})
		AssertThat(t, rsp, Code{http.StatusInternalServerError})
		AssertThat(t, rsp.Body, Is{Not{nil}})
		AssertThat(t, rsp.Header.Get("Content-Type"), Is{"application/json"})
	})
}

func TestCheckOrigin(t *testing.T) {
	t.Run("Check origin", func(t *testing.T) {
		r, _ := http.NewRequest(http.MethodGet, "http://localhost", nil)
		r.Header.Add("Origin", "some-host.example.com")
		AssertThat(t, checkOrigin("*")(r), Is{true})
		AssertThat(t, checkOrigin("some-host.example.com,another-host.example.com")(r), Is{true})
		AssertThat(t, checkOrigin("missing-host.example.com,another-host.example.com")(r), Is{false})
	})
}

func TestConfigureWsProxy(t *testing.T) {
	t.Run("Sets per-proxy upgrader when allowed-origin configured", func(t *testing.T) {
		prev := allowedOrigin
		allowedOrigin = "https://ui.example.com"
		defer func() { allowedOrigin = prev }()

		target, _ := url.Parse("ws://127.0.0.1:9")
		wsProxy := websocketproxy.NewProxy(target)
		configureWsProxy(wsProxy)
		AssertThat(t, wsProxy.Upgrader, Not{Is{nil}})
		AssertThat(t, wsProxy.Upgrader.CheckOrigin, Not{Is{nil}})
	})
}

func TestResolveBrowsersConfPath(t *testing.T) {
	t.Run("Flag path wins", func(t *testing.T) {
		AssertThat(t, resolveBrowsersConfPath("/custom/browsers.json"), EqualTo{"/custom/browsers.json"})
	})

	t.Run("Discovers browsers.json in temp dir", func(t *testing.T) {
		dir := t.TempDir()
		path := filepath.Join(dir, "browsers.json")
		AssertThat(t, os.WriteFile(path, []byte(`{}`), 0644), Is{nil})

		prev, _ := os.Getwd()
		AssertThat(t, os.Chdir(dir), Is{nil})
		defer func() { _ = os.Chdir(prev) }()

		AssertThat(t, resolveBrowsersConfPath(""), EqualTo{"browsers.json"})
	})
}
