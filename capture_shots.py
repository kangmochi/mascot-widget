#!/usr/bin/env python3
"""Render README screenshots from the plugin's real CSS with demo data.

No personal chat or session data is involved: the app chrome is a neutral
placeholder and every value shown is synthetic.
"""
import pathlib
import re

ROOT = pathlib.Path('/home/hermes/work/mascot-guide')
src = (ROOT / 'desktop' / 'plugin.js').read_text()
css = re.search(r"const CSS = `([\s\S]*?)`", src).group(1)
FULL = re.search(r"const MASCOT_FULL = '([^']+)'", src).group(1)

ROWS = [('Model', 'deepseek-v4.1-flash'), ('Tokens', '212K'), ('Context', '38%'), ('Activity', 'writing')]


def row(k, v):
    return f'<div class="mg-row"><span>{k}</span><b>{v}</b></div>'


def widget(aura=False, state='idle', speech='Standing by, call me if needed', size=96, extra=''):
    aura_span = '<span class="mg-aura"></span>' if aura else ''
    return f"""
  <div class="mg-float" style="left:232px;bottom:56px;--mg-aura-r:30px;--mg-aura-a:70%;--mg-aura-o:.7;--mg-aura-c:#a855f7">
    <div class="mg-stack">
      <div class="mg-say" data-state="{state}">{speech}</div>
      <button class="mg-mascot-btn" type="button" data-breath="true" data-float="false"
              data-state="{state}" data-pulse="true" data-aura="{str(aura).lower()}" data-aura-style="soft"
              style="--mg-size:{size}px">
        <div class="mg-stage">{aura_span}<div class="mg-art"><img src="{FULL}" alt=""></div></div>
      </button>
      <div class="mg-under">
        <div class="mg-chips">
          <div class="mg-pill"><span class="mg-pill-k">OpenRouter</span><span class="mg-pill-v">$0.42</span></div>
          <div class="mg-pill" data-wide="true"><span class="mg-pill-k">Model</span><span class="mg-pill-v">deepseek-v4.1-flash</span></div>
        </div>
      </div>
      {extra}
    </div>
  </div>"""


SETTINGS = f"""
  <div class="mg-modal" data-side="left">
    <div class="mg-modal-head">
      <span class="mg-title">Settings</span>
      <div class="mg-modal-actions"><button class="mg-btn mg-modal-close" type="button">Done</button></div>
    </div>
    <div class="mg-tabs">
      <button class="mg-tab" type="button" data-on="false">Simple</button>
      <button class="mg-tab" type="button" data-on="true">Advanced</button>
    </div>
    <div class="mg-modal-grid mg-single">
      <div class="mg-sec-card">
        <div class="mg-card-h"><span>Colour</span></div>
        <div class="mg-muted">Pick a colour, or keep it on the theme.</div>
        <div class="mg-muted">Cards</div>
        <div class="mg-colour-row">
          <input class="mg-colour" type="color" value="#12343b"><span>#12343B</span>
          <button class="mg-btn" type="button" style="flex:none;padding:3px 8px">Theme</button>
        </div>
        <div class="mg-swatches">
          {''.join(f'<button class="mg-swatch" type="button" style="background:{h};outline:{"2px solid var(--ui-accent)" if h == "#14b8a6" else "none"}"></button>' for h in ['#4c8dff', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#14b8a6', '#64748b', '#e5e7eb'])}
        </div>
        <div class="mg-muted">Chat bubble</div>
        <div class="mg-colour-row">
          <input class="mg-colour" type="color" value="#2a1140"><span>#2A1140</span>
          <button class="mg-btn" type="button" style="flex:none;padding:3px 8px">Theme</button>
        </div>
        <div class="mg-muted">Aura glow</div>
        <div class="mg-colour-row">
          <input class="mg-colour" type="color" value="#a855f7"><span>#A855F7</span>
          <button class="mg-btn" type="button" style="flex:none;padding:3px 8px">Theme</button>
        </div>
        <div class="mg-actions"><button class="mg-btn" type="button">From avatar</button></div>
        <div class="mg-slider"><span>Aura size</span><input type="range" min="0" max="80" value="30"><b>30px</b></div>
        <div class="mg-slider"><span>Intensity</span><input type="range" min="0" max="100" value="70"><b>70%</b></div>
      </div>
      <div class="mg-sec-card">
        <div class="mg-card-h"><span>Bubble &amp; cards</span></div>
        <div class="mg-muted">Nudge the bubble or the cards without moving the mascot.</div>
        <div class="mg-muted">Chat bubble</div>
        <div class="mg-slider"><span>Left / right</span><input type="range" min="-120" max="120" value="0"><b>0px</b></div>
        <div class="mg-slider"><span>Up / down</span><input type="range" min="-120" max="120" value="0"><b>0px</b></div>
        <div class="mg-muted">Cards</div>
        <div class="mg-slider"><span>Left / right</span><input type="range" min="-120" max="120" value="-18"><b>-18px</b></div>
      </div>
    </div>
  </div>"""

CHROME = """
<style>
  :root{
    --ui-text-primary:#e6edf7; --ui-text-secondary:#a9b6c9; --ui-text-tertiary:#77839a;
    --ui-text-quaternary:#5a6478; --ui-stroke-secondary:#263041; --ui-accent:#4c8dff;
    --ui-bg-primary:#0d1117;
  }
  html,body{margin:0;height:100%;overflow:hidden;background:#0d1117;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif}
  .win{position:relative;height:100vh;overflow:hidden;background:#0d1117}
  .side{position:absolute;left:0;top:0;bottom:0;width:190px;border-right:1px solid var(--ui-stroke-secondary);padding:16px 12px}
  .side .brand{width:34px;height:34px;border-radius:9px;background:#151b26;margin-bottom:18px}
  .side .nav{height:11px;border-radius:5px;background:#151b26;margin:10px 0}
  .side .nav.w60{width:60%} .side .nav.w80{width:80%} .side .nav.w45{width:45%}
  .main{position:absolute;left:190px;right:0;top:0;bottom:36px;padding:26px 30px;display:flex;flex-direction:column;gap:14px}
  .main .line{height:12px;border-radius:6px;background:#11161f}
  .main .line.w38{width:38%} .main .line.w86{width:86%} .main .line.w72{width:72%}
  .main .card{width:340px;height:120px;border-radius:10px;background:#10151e;border:1px solid #1b2230}
  .mg-modal{max-height:none !important;overflow:visible !important}
  .mg-modal::-webkit-scrollbar{width:0;height:0}
  .status{position:absolute;left:0;right:0;bottom:0;height:36px;border-top:1px solid var(--ui-stroke-secondary);
    display:flex;align-items:center;justify-content:flex-end;padding:0 14px;font-size:11px;color:var(--ui-text-quaternary)}
</style>
"""

BODY = """
<div class="win">
  <div class="side">
    <div class="brand"></div>
    <div class="nav w80"></div><div class="nav w60"></div><div class="nav w80"></div>
    <div class="nav w45"></div><div class="nav w60"></div>
  </div>
  <div class="main">
    <div class="line w38"></div><div class="line w86"></div><div class="line w72"></div>
    <div class="card"></div><div class="line w86"></div><div class="line w38"></div>
  </div>
  <div class="status">deepseek-v4.1-flash · high</div>
  {content}
</div>
"""

SCENES = {
    'shot-widget': widget(aura=False),
    'shot-working': widget(aura=True, state='busy', speech='Writing the deploy script…'),
    'shot-settings': widget(aura=True, state='busy', speech='Writing the deploy script…', extra=SETTINGS),
}

for name, content in SCENES.items():
    html = f"""<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><title>{name}</title>
{CHROME}<style>{css}</style></head>
<body>{BODY.format(content=content)}</body></html>"""
    out = ROOT / f'{name}.html'
    out.write_text(html)
    print('wrote', out.name, len(html), 'bytes')
