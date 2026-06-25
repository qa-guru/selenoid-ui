package selenoid

import (
	"encoding/json"
	"os"
	"strings"
)

const (
	protocolWebDriver  = "webdriver"
	protocolPlaywright = "playwright"
)

// BrowserVersionMeta describes browser version configuration exposed to the UI.
type BrowserVersionMeta struct {
	Protocol string `json:"protocol"`
}

// BrowserProtocols maps browser name -> version -> metadata.
type BrowserProtocols map[string]map[string]BrowserVersionMeta

type browsersFile struct {
	Default  string                     `json:"default"`
	Versions map[string]json.RawMessage `json:"versions"`
}

type versionConfig struct {
	Protocol string `json:"protocol"`
}

// LoadBrowserProtocols reads browsers.json and returns protocol metadata per browser version.
func LoadBrowserProtocols(path string) (BrowserProtocols, error) {
	if path == "" {
		return nil, nil
	}

	data, err := os.ReadFile(path)
	if err != nil {
		return nil, err
	}

	var raw map[string]browsersFile
	if err := json.Unmarshal(data, &raw); err != nil {
		return nil, err
	}

	result := make(BrowserProtocols)
	for browser, cfg := range raw {
		versions := make(map[string]BrowserVersionMeta)
		for ver, rawVer := range cfg.Versions {
			protocol := protocolWebDriver
			var meta versionConfig
			if err := json.Unmarshal(rawVer, &meta); err == nil && meta.Protocol != "" {
				protocol = strings.ToLower(meta.Protocol)
			}
			versions[ver] = BrowserVersionMeta{Protocol: protocol}
		}
		result[browser] = versions
	}
	return result, nil
}

// Protocol returns the configured protocol for a browser version.
func (bp BrowserProtocols) Protocol(browser, version string) string {
	if bp == nil {
		return protocolWebDriver
	}
	if versions, ok := bp[browser]; ok {
		if meta, ok := versions[version]; ok {
			return meta.Protocol
		}
	}
	return protocolWebDriver
}

// IsPlaywright reports whether the browser version uses the Playwright protocol.
func (bp BrowserProtocols) IsPlaywright(browser, version string) bool {
	return bp.Protocol(browser, version) == protocolPlaywright
}
