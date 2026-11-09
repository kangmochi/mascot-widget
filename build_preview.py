#!/usr/bin/env python3
"""Generate a static preview of the plugin's real CSS + mascot art.

  python3 build_preview.py                  -> preview.html (mascot + bubble)
  python3 build_preview.py --with-settings   -> preview.html (adds the settings overlay)
"""

import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).parent
src = (ROOT / "plugin.js").read_text()
css = re.search(r"const CSS = `([\s\S]*?)`", src).group(1)
FULL = re.search(r"const MASCOT_FULL = '([^']+)'", src).group(1)

ROWS = [("Model", "deepseek-v4.1-flash"), ("Tokens", "212K"), ("Cost", "$1.24"), ("Activity", "writing")]


def row(k, v):
    return f'<div class="mg-row"><span>{k}</span><b>{v}</b></div>'


def toggle(label, on):
    return (
        f'<div class="mg-toggle"><span>{label}</span>'
        f'<span class="mg-switch" data-on="{str(on).lower()}"><i></i></span></div>'
    )


SETTINGS = f"""
  <div class="mg-modal">
    <div class="mg-modal-head">
      <span class="mg-title">Settings</span>
      <button class="mg-btn mg-modal-close" type="button">Done</button>
    </div>
    <div class="mg-modal-grid">
      <div class="mg-sec-card">
        <div class="mg-card-h"><span>Mascot image</span></div>
        <div class="mg-keyrow" style="display:flex;gap:6px;align-items:center">
          <span class="mg-muted" style="flex:1">jiwoo-cutout.png</span>
          <button class="mg-btn" type="button">Use default</button>
        </div>
        {toggle("Auto-cut background", False)}
      </div>
      <div class="mg-sec-card">
        <div class="mg-card-h"><span>Cards below mascot</span></div>
        {toggle("Spend / tokens", True)}
        {toggle("Model", True)}
        {toggle("Context", True)}
        {toggle("Session + tools", False)}
      </div>
      <div class="mg-sec-card">
        <div class="mg-card-h"><span>Size</span></div>
        <div class="mg-sizes">
          <button class="mg-size" type="button">S</button>
          <button class="mg-size" data-on="true" type="button">M</button>
          <button class="mg-size" type="button">L</button>
          <button class="mg-size" type="button">XL</button>
        </div>
      </div>
      <div class="mg-sec-card">
        <div class="mg-card-h"><span>Language</span></div>
        <div class="mg-sizes">
          <button class="mg-size" data-on="true" type="button">Auto</button>
          <button class="mg-size" type="button">EN</button>
          <button class="mg-size" type="button">ID</button>
        </div>
      </div>
      <div class="mg-sec-card">
        <div class="mg-card-h"><span>Widgets</span></div>
        {toggle("Active model", True)}
        {toggle("Token usage", True)}
        {toggle("Context window", True)}
        {toggle("Session cost", True)}
        {toggle("Agent activity", True)}
      </div>
    </div>
  </div>
"""

FLOAT = f"""
  <div class="mg-float" style="left:24px;bottom:64px">
    <div class="mg-stack">
      <div class="mg-say" data-state="busy">Lagi kerja… terminal</div>
      <button class="mg-mascot-btn" type="button" data-breath="true" data-float="true" data-state="busy" data-pulse="true">
        <img src="{FULL}" alt="">
      </button>
      <div class="mg-under">
        <div class="mg-chips">
          <div class="mg-pill"><span class="mg-pill-k">OpenRouter</span><span class="mg-pill-v">$1.24</span></div>
          <div class="mg-pill"><span class="mg-pill-k">Model</span><span class="mg-pill-v">deepseek-v4.1-flash</span></div>
        </div>
        <button class="mg-gear" type="button">⚙</button>
      </div>
      <div class="mg-bubble">
        <div>
          <div class="mg-card-h"><span>Agent Status</span><span class="mg-dot" data-state="busy"></span></div>
          {"".join(row(k, v) for k, v in ROWS)}
        </div>
        <div class="mg-actions"><button class="mg-btn" type="button">Copy status</button></div>
        <div class="mg-actions" style="margin-top:6px">
          <button class="mg-btn" type="button">Compress</button>
          <button class="mg-btn" type="button">Stop</button>
        </div>
      </div>
    </div>
  </div>
"""

CHROME = """
<style>
  :root{
    --ui-text-primary:#e6edf7; --ui-text-secondary:#a9b6c9; --ui-text-tertiary:#77839a;
    --ui-text-quaternary:#5a6478; --ui-stroke-secondary:#263041; --ui-accent:#4c8dff;
    --chrome-action-hover:#1b2333; --ui-bg-primary:#0d1117;
  }
  html,body{margin:0;height:100%;background:#0d1117;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif}
  .win{position:relative;height:100vh;overflow:hidden}
  .side{position:absolute;left:0;top:0;bottom:0;width:190px;border-right:1px solid var(--ui-stroke-secondary);padding:14px 10px}
  .side .nav{height:11px;border-radius:5px;background:#151b26;margin:8px 0}
  .side .nav.w60{width:60%} .side .nav.w80{width:80%}
  .main{position:absolute;left:190px;right:0;top:0;bottom:34px;padding:20px 24px;display:flex;flex-direction:column;gap:12px}
  .main .line{height:11px;border-radius:5px;background:#151b26}
  .main .line.w40{width:40%} .main .line.w88{width:88%} .main .line.w70{width:70%}
  .status{position:absolute;left:0;right:0;bottom:0;height:34px;border-top:1px solid var(--ui-stroke-secondary);
    display:flex;align-items:center;justify-content:flex-end;padding:0 12px;font-size:11px;color:var(--ui-text-quaternary)}
</style>
"""

html = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Mascot Guide — preview</title>
{CHROME}
<style>{css}</style>
</head>
<body>
<div class="win">
  <div class="side">
    <div class="nav w80"></div><div class="nav w60"></div><div class="nav w80"></div>
    <div class="nav w60"></div><div class="nav w80"></div><div class="nav w60"></div>
  </div>
  <div class="main">
    <div class="line w40"></div><div class="line w88"></div><div class="line w70"></div>
    <div class="line w88"></div><div class="line w40"></div>
  </div>
  <div class="status">deepseek-v4.1-flash · high</div>
{SETTINGS if "--with-settings" in sys.argv else ""}
{FLOAT}
</div>
</body>
</html>
"""

(ROOT / "preview.html").write_text(html)
print(f"wrote preview.html ({len(html)} bytes)")
