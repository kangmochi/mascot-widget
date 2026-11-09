# Roadmap / ideas parking lot

Ideas captured from review sessions. Nothing here is implemented yet — this file is the
queue we pick from, ordered by (impact × cheapness).

## Widget options (appear in **Settings ▸ Widgets**, toggleable, can also render as cards
under the mascot)

| Idea | Data source | Notes |
| --- | --- | --- |
| Predictive context ("full in ~38m") | `session.usage` history in a local atom | Fit a slope over the last N usage samples; show ETA once there are ≥3 samples |
| Burn rate + daily cost | usage samples + `ctx.storage` day bucket | `$0.03 / session · $0.41 today`; reset the bucket at local midnight |
| Tool heatmap | `tool.start` events | Small bar of the last ~8 tools, colored per kind (terminal / web / file / other) |
| Next cron | `cron.list` RPC | `next: 21:00`; hide when no jobs |
| Session clock | `session.activate` timestamp | `12m · 9 tools`, already partially in the session row |
| Token sparkline | usage history | Shipped as the sparkline in the status card; could be an independent widget |
| Context ring | usage | Shipped in the status-card header; could also be a card |
| Prompt-cache hit | `cache_hit_pct` | Row exists; promote to its own card |

## Behaviour / appearance (not widgets — they change how the mascot behaves)

- **Reaction set** — blink, shake on error, small hop on turn complete (CSS only).
- **Accent per state** — idle blue, working violet, warning red, done green; every element
  follows one accent variable.
- **Snap & auto-hide** — stick to a window edge, shrink in narrow layouts.
- **Focus timer** — click starts a 25-minute session; the mascot naps when you go idle.
- **Voice summary** — click reads the status out loud (needs gateway TTS).
- **`::mascot{note="..."}` directive** — the agent can make the mascot say a line in chat
  (uses the `transcript.directives` area; newer desktop builds only).

## Rejected / skipped

- **Music integration** — a built-in ambient player with a beat-reactive mascot was
  considered and dropped: duplicate of the bundled Radio plugin, and a plugin-rendered
  window cannot read the system media session (Spotify / YT Music) anyway.

## Constraints to respect

- No credentials in the renderer: account balance stays out of scope (would need a backend
  that reads the provider key server-side).
- Everything must degrade on older desktop builds: areas are feature-detected, no imports
  beyond `@hermes/plugin-sdk`, `react`, `react/jsx-runtime`.
- Keep it one file; no build step, no network calls from the plugin itself.

## Shipped (v0.3)

- Context ETA card, daily spend card, cache-hit card, next-cron card, session card
- Tool heatmap colours on the trail dots
- Reactions: hop on turn complete, shake on error
- Per-state accent on the bubble border; edge snap after drag; fade in narrow windows
- Focus timer (25 min) with a live countdown; voice summary via `speechSynthesis`
- `::mascot{note="..."}` transcript directive (newer hosts)
- Locales: EN, ID, ES, PT, JA, ZH, KO

## Next slice (proposed)

1. Predictive context
2. Burn rate + daily cost
3. Tool heatmap
4. Reaction set + accent per state
