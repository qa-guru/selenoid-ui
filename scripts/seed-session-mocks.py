#!/usr/bin/env python
"""Seed rich finished-session mocks into local selenoid artifact dirs.

Fills /sessions/?json so Finished sessions UI can show every column:
id · date · duration · quota · name · video/log/har icons.

Also writes viewable artifacts:
  · .log — multiline session log text (Session logs panel)
  · .har — valid HAR 1.2 JSON with log.entries (HarViewer)
  · .mp4 — tiny stub unless a real showcase copy exists

Usage (from selenoid-ui/):
  python scripts/seed-session-mocks.py
  python scripts/seed-session-mocks.py --clean

Hub shortcut: projects/selenoid-home/dev/scripts/seed-session-mocks.py
Writes into sibling ../dev/{video,logs,har}.
"""

from __future__ import annotations

import argparse
import json
import shutil
from datetime import datetime, timedelta, timezone
from pathlib import Path

DEV_ROOT = Path(__file__).resolve().parents[2] / "dev"
VIDEO_DIR = DEV_ROOT / "video"
LOGS_DIR = DEV_ROOT / "logs"
HAR_DIR = DEV_ROOT / "har"

TZ = timezone(timedelta(hours=2))
NOW = datetime(2026, 7, 28, 12, 50, 0, tzinfo=TZ)

# Video: tiny placeholder (list icons only need the filename). Showcase copies a real mp4.
VIDEO_STUB_BYTES = b"mock"

# Session log text — readable in Session logs panel (not the literal "mock").
MOCK_LOG = """\
2026-07-28 12:44:01 INFO  [SESSION_CREATED] [chrome 148.0]
2026-07-28 12:44:02 INFO  [PROXY_TO] [http://172.17.0.2:4444]
2026-07-28 12:44:03 INFO  [INIT] capabilities: enableVNC=true enableVideo=true enableHAR=true
2026-07-28 12:44:05 INFO  [NAVIGATE] https://example.com/
2026-07-28 12:44:06 INFO  [HAR_CAPTURE_STARTED] CDP Network domain enabled
2026-07-28 12:45:12 INFO  [CLICK] css=#submit
2026-07-28 12:46:00 INFO  [SESSION_DELETED] reason=client
2026-07-28 12:46:01 INFO  [VIDEO_RENAMED] done
2026-07-28 12:46:01 INFO  [HAR_FLUSHED] entries=3
"""


def _iso(dt: datetime) -> str:
    return dt.isoformat()


def _mock_har(session_id: str, *, started: datetime | None = None) -> dict:
    """Minimal valid HAR 1.2 so HarViewer can parse log.entries."""
    base = started or NOW - timedelta(minutes=5)
    t0 = _iso(base)
    t1 = _iso(base + timedelta(milliseconds=120))
    t2 = _iso(base + timedelta(milliseconds=340))
    return {
        "log": {
            "version": "1.2",
            "creator": {"name": "selenoid", "version": "3.0.0-mock"},
            "pages": [
                {
                    "startedDateTime": t0,
                    "id": "page_1",
                    "title": "Example Domain",
                    "pageTimings": {"onContentLoad": 180.0, "onLoad": 420.0},
                }
            ],
            "entries": [
                {
                    "pageref": "page_1",
                    "startedDateTime": t0,
                    "time": 42.0,
                    "request": {
                        "method": "GET",
                        "url": "https://example.com/",
                        "httpVersion": "HTTP/1.1",
                        "cookies": [],
                        "headers": [
                            {"name": "Accept", "value": "text/html"},
                            {"name": "User-Agent", "value": "selenoid-mock"},
                        ],
                        "queryString": [],
                        "headersSize": 128,
                        "bodySize": 0,
                    },
                    "response": {
                        "status": 200,
                        "statusText": "OK",
                        "httpVersion": "HTTP/1.1",
                        "cookies": [],
                        "headers": [{"name": "Content-Type", "value": "text/html"}],
                        "content": {
                            "size": 1256,
                            "mimeType": "text/html",
                            "text": "<html><body>Example Domain</body></html>",
                        },
                        "redirectURL": "",
                        "headersSize": 96,
                        "bodySize": 1256,
                    },
                    "cache": {},
                    "timings": {
                        "blocked": 1,
                        "dns": 2,
                        "connect": 3,
                        "ssl": 4,
                        "send": 5,
                        "wait": 20,
                        "receive": 7,
                    },
                },
                {
                    "pageref": "page_1",
                    "startedDateTime": t1,
                    "time": 18.0,
                    "request": {
                        "method": "GET",
                        "url": "https://example.com/styles.css",
                        "httpVersion": "HTTP/1.1",
                        "cookies": [],
                        "headers": [{"name": "Accept", "value": "text/css"}],
                        "queryString": [],
                        "headersSize": 64,
                        "bodySize": 0,
                    },
                    "response": {
                        "status": 200,
                        "statusText": "OK",
                        "httpVersion": "HTTP/1.1",
                        "cookies": [],
                        "headers": [{"name": "Content-Type", "value": "text/css"}],
                        "content": {"size": 412, "mimeType": "text/css"},
                        "redirectURL": "",
                        "headersSize": 80,
                        "bodySize": 412,
                    },
                    "cache": {},
                    "timings": {"send": 1, "wait": 12, "receive": 5},
                },
                {
                    "pageref": "page_1",
                    "startedDateTime": t2,
                    "time": 55.0,
                    "request": {
                        "method": "POST",
                        "url": f"https://api.example.com/sessions/{session_id}/events",
                        "httpVersion": "HTTP/1.1",
                        "cookies": [],
                        "headers": [
                            {"name": "Content-Type", "value": "application/json"},
                            {"name": "Accept", "value": "application/json"},
                        ],
                        "queryString": [],
                        "postData": {
                            "mimeType": "application/json",
                            "text": '{"event":"click","target":"#submit"}',
                        },
                        "headersSize": 140,
                        "bodySize": 36,
                    },
                    "response": {
                        "status": 201,
                        "statusText": "Created",
                        "httpVersion": "HTTP/1.1",
                        "cookies": [],
                        "headers": [{"name": "Content-Type", "value": "application/json"}],
                        "content": {
                            "size": 27,
                            "mimeType": "application/json",
                            "text": '{"ok":true,"id":"evt-1"}',
                        },
                        "redirectURL": "",
                        "headersSize": 88,
                        "bodySize": 27,
                    },
                    "cache": {},
                    "timings": {"send": 2, "wait": 40, "receive": 13},
                },
            ],
        }
    }


def _meta(
    session_id: str,
    *,
    quota: str,
    name: str,
    started: datetime,
    finished: datetime,
    browser: str = "chrome",
    version: str = "148.0",
    manual: bool = False,
) -> dict:
    caps: dict = {
        "browserName": browser,
        "version": version,
        "browserVersion": version,
        "screenResolution": "1920x1080x24",
        "enableVNC": True,
        "name": name,
    }
    if manual:
        caps["labels"] = {"manual": "true"}
    return {
        "id": session_id,
        "quota": quota,
        "capabilities": caps,
        "started": _iso(started),
        "finished": _iso(finished),
    }


# Cover every Finished-sessions column + artifact combo + pagination (>10).
MOCKS: list[dict] = [
    {
        "id": "mock-full-alice-01",
        "video": True,
        "log": True,
        "har": True,
        "meta": _meta(
            "mock-full-alice-01",
            quota="alice",
            name="com.example.CheckoutTest.shouldPayWithCard",
            started=NOW - timedelta(hours=2, minutes=5),
            finished=NOW - timedelta(hours=2),
        ),
    },
    {
        "id": "mock-full-bob-02",
        "video": True,
        "log": True,
        "har": True,
        "meta": _meta(
            "mock-full-bob-02",
            quota="bob.smith",
            name="com.aerokube.selenoid.DemoTest.veryLongNameThatShouldTruncateInTheArchiveRow",
            started=NOW - timedelta(hours=1, minutes=45),
            finished=NOW - timedelta(hours=1, minutes=30),
            browser="firefox",
            version="150.0",
        ),
    },
    {
        "id": "mock-video-only-03",
        "video": True,
        "log": False,
        "har": False,
        "meta": _meta(
            "mock-video-only-03",
            quota="ci-runner",
            name="SmokeSuite.openHome",
            started=NOW - timedelta(minutes=50),
            finished=NOW - timedelta(minutes=48, seconds=20),
        ),
    },
    {
        "id": "mock-log-har-04",
        "video": False,
        "log": True,
        "har": True,
        "meta": _meta(
            "mock-log-har-04",
            quota="qa-team",
            name="ApiProxyHarCapture.recordsXHR",
            started=NOW - timedelta(minutes=40),
            finished=NOW - timedelta(minutes=39, seconds=5),
            browser="chrome",
            version="149.0",
        ),
    },
    {
        "id": "mock-short-dur-05",
        "video": True,
        "log": True,
        "har": False,
        "meta": _meta(
            "mock-short-dur-05",
            quota="unknown",
            name="Manual session",
            started=NOW - timedelta(minutes=35),
            finished=NOW - timedelta(minutes=34, seconds=48),
            manual=True,
        ),
    },
    {
        "id": "mock-long-dur-06",
        "video": True,
        "log": True,
        "har": True,
        "meta": _meta(
            "mock-long-dur-06",
            quota="nightly",
            name="NightlyRegression.fullCartFlow",
            started=NOW - timedelta(hours=5),
            finished=NOW - timedelta(hours=3, minutes=12),
            browser="msedge",
            version="145.0",
        ),
    },
    {
        "id": "mock-no-name-07",
        "video": True,
        "log": False,
        "har": True,
        "meta": _meta(
            "mock-no-name-07",
            quota="guest",
            name="",
            started=NOW - timedelta(minutes=25),
            finished=NOW - timedelta(minutes=20),
        ),
    },
    {
        "id": "mock-no-quota-08",
        "video": True,
        "log": True,
        "har": True,
        "meta": {
            "id": "mock-no-quota-08",
            "capabilities": {
                "browserName": "playwright-chromium",
                "version": "1.61.1",
                "name": "pw.chromium.login",
                "enableVNC": False,
            },
            "started": _iso(NOW - timedelta(minutes=18)),
            "finished": _iso(NOW - timedelta(minutes=15)),
        },
    },
    {
        "id": "mock-android-09",
        "video": True,
        "log": True,
        "har": False,
        "meta": _meta(
            "mock-android-09",
            quota="mobile-lab",
            name="AndroidUi.swipeGallery",
            started=NOW - timedelta(minutes=12),
            finished=NOW - timedelta(minutes=8),
            browser="android",
            version="16.0",
        ),
    },
    {
        "id": "mock-pager-a-10",
        "video": True,
        "log": False,
        "har": False,
        "meta": _meta(
            "mock-pager-a-10",
            quota="alice",
            name="Pager.pageOneLast",
            started=NOW - timedelta(minutes=7),
            finished=NOW - timedelta(minutes=6),
        ),
    },
    {
        "id": "mock-pager-b-11",
        "video": False,
        "log": True,
        "har": False,
        "meta": _meta(
            "mock-pager-b-11",
            quota="bob.smith",
            name="Pager.pageTwoFirst",
            started=NOW - timedelta(minutes=5),
            finished=NOW - timedelta(minutes=4, seconds=10),
        ),
    },
    {
        "id": "mock-pager-c-12",
        "video": True,
        "log": True,
        "har": True,
        "meta": _meta(
            "mock-pager-c-12",
            quota="ci-runner",
            name="Pager.fullArtifacts",
            started=NOW - timedelta(minutes=3),
            finished=NOW - timedelta(minutes=1, seconds=30),
        ),
    },
]

# Enrich real leftover videos so existing rows also show name/quota/duration.
LEGACY_ENRICH = [
    {
        "id": "83d74cf9-b841-4d2c-b89f-da665d3407b5",
        "video": True,  # already on disk
        "log": True,
        "har": True,
        "write_video": False,
        "meta": _meta(
            "83d74cf9-b841-4d2c-b89f-da665d3407b5",
            quota="alice",
            name="com.example.LegacyRun.checkoutHappyPath",
            started=datetime(2026, 7, 27, 13, 58, 0, tzinfo=TZ),
            finished=datetime(2026, 7, 27, 14, 1, 53, tzinfo=TZ),
        ),
    },
    {
        "id": "selenoid0dff39d0de551395a9be3f6293f4473d",
        "video": True,
        "log": True,
        "har": False,
        "write_video": False,
        "meta": _meta(
            "selenoid0dff39d0de551395a9be3f6293f4473d",
            quota="unknown",
            name="Manual session",
            started=datetime(2026, 7, 28, 12, 44, 0, tzinfo=TZ),
            finished=datetime(2026, 7, 28, 12, 46, 1, tzinfo=TZ),
            manual=True,
        ),
    },
]


def _write_video_stub(path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    if not path.exists():
        path.write_bytes(VIDEO_STUB_BYTES)


def _write_text(path: Path, text: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text, encoding="utf-8")


def seed_one(entry: dict) -> None:
    sid = entry["id"]
    if entry.get("video") and entry.get("write_video", True):
        _write_video_stub(VIDEO_DIR / f"{sid}.mp4")
    if entry.get("log"):
        _write_text(LOGS_DIR / f"{sid}.log", MOCK_LOG)
    if entry.get("har"):
        started = None
        meta = entry.get("meta") or {}
        raw = meta.get("started")
        if isinstance(raw, str):
            try:
                started = datetime.fromisoformat(raw)
            except ValueError:
                started = None
        har = _mock_har(sid, started=started)
        _write_text(
            HAR_DIR / f"{sid}.har",
            json.dumps(har, indent=2, ensure_ascii=False) + "\n",
        )
    meta = entry.get("meta")
    if meta is not None:
        LOGS_DIR.mkdir(parents=True, exist_ok=True)
        (LOGS_DIR / f"{sid}.json").write_text(
            json.dumps(meta, indent=4, ensure_ascii=False) + "\n",
            encoding="utf-8",
        )


def clean_mocks() -> int:
    removed = 0
    for directory, patterns in (
        (VIDEO_DIR, ("mock-*.mp4",)),
        (LOGS_DIR, ("mock-*.log", "mock-*.json")),
        (HAR_DIR, ("mock-*.har",)),
    ):
        if not directory.is_dir():
            continue
        for pattern in patterns:
            for path in directory.glob(pattern):
                path.unlink()
                removed += 1
    return removed


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--clean",
        action="store_true",
        help="Remove mock-* artifact files only (keeps legacy enrich)",
    )
    args = parser.parse_args()

    if args.clean:
        n = clean_mocks()
        print(json.dumps({"ok": True, "removed": n}))
        return

    for directory in (VIDEO_DIR, LOGS_DIR, HAR_DIR):
        directory.mkdir(parents=True, exist_ok=True)

    for entry in MOCKS + LEGACY_ENRICH:
        seed_one(entry)

    # Keep a real mp4 byte-size for one mock so /video/ open is not empty silence.
    real_mp4 = VIDEO_DIR / "83d74cf9-b841-4d2c-b89f-da665d3407b5.mp4"
    showcase = VIDEO_DIR / "mock-full-alice-01.mp4"
    if real_mp4.is_file() and showcase.is_file() and showcase.stat().st_size <= len(VIDEO_STUB_BYTES):
        shutil.copyfile(real_mp4, showcase)

    print(
        json.dumps(
            {
                "ok": True,
                "mocks": len(MOCKS),
                "legacy_enriched": len(LEGACY_ENRICH),
                "video": str(VIDEO_DIR),
                "logs": str(LOGS_DIR),
                "har": str(HAR_DIR),
            },
            indent=2,
        )
    )


if __name__ == "__main__":
    main()
