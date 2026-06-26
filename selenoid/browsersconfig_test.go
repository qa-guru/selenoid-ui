package selenoid

import (
	"os"
	"path/filepath"
	"testing"

	. "github.com/aandryashin/matchers"
)

func TestLoadBrowserProtocols(t *testing.T) {
	dir := t.TempDir()
	path := filepath.Join(dir, "browsers.json")
	err := os.WriteFile(path, []byte(`{
  "chrome": {
    "default": "latest",
    "versions": {
      "latest": {
        "image": "selenoid/chrome",
        "port": "4444"
      }
    }
  },
  "playwright-chromium": {
    "default": "1.61.1",
    "versions": {
      "1.61.1": {
        "image": "mcr.microsoft.com/playwright:v1.61.1-noble",
        "protocol": "playwright"
      }
    }
  }
}`), 0644)
	AssertThat(t, err, Is{nil})

	protocols, err := LoadBrowserProtocols(path)
	AssertThat(t, err, Is{nil})
	AssertThat(t, protocols.Protocol("chrome", "latest"), EqualTo{"webdriver"})
	AssertThat(t, protocols.Protocol("playwright-chromium", "1.61.1"), EqualTo{"playwright"})
	AssertThat(t, protocols.IsPlaywright("playwright-chromium", "1.61.1"), Is{true})
	AssertThat(t, protocols.IsPlaywright("chrome", "latest"), Is{false})
}
