#!/usr/bin/env bash
# Dependency-free smoke test: loads the real plugin with stubbed SDK/react
# modules and renders every contribution (chip, pane, palette, settings).
set -euo pipefail
cd "$(dirname "$0")"
cp ../plugin.js ./plugin.copy.mjs
node smoke.mjs
rm -f ./plugin.copy.mjs
