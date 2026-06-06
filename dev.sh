#!/usr/bin/env bash
#
# dev.sh — launch the portfolio frontend and chatbot backend together.
#
# Streams both logs into this one terminal with [backend]/[frontend] prefixes.
# A single Ctrl+C stops both.
#
# Assumes deps are already installed (chatbot-backend/venv and
# portfolio-frontend/node_modules). Run the per-project setup first if not.

set -euo pipefail

# Enable job control so each background job below gets its OWN process group
# (pgid == $!). That lets cleanup signal the whole group, killing uvicorn's
# --reload child too. Without this, `&` jobs share the script's group.
set -m

# Resolve repo root from the script's own location so it runs from anywhere.
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND="$ROOT/chatbot-backend"
FRONTEND="$ROOT/portfolio-frontend"

# Colors (fall back to empty strings if not a tty).
if [ -t 1 ]; then
  C_BACK=$'\033[36m'   # cyan
  C_FRONT=$'\033[35m'  # magenta
  C_RESET=$'\033[0m'
else
  C_BACK="" C_FRONT="" C_RESET=""
fi

# Preflight: fail fast with a friendly message instead of a cryptic crash.
if [ ! -f "$BACKEND/venv/bin/activate" ]; then
  echo "✗ Missing backend venv at chatbot-backend/venv." >&2
  echo "  Set it up first:  cd chatbot-backend && ./setup.sh" >&2
  exit 1
fi
if [ ! -d "$FRONTEND/node_modules" ]; then
  echo "✗ Missing frontend deps at portfolio-frontend/node_modules." >&2
  echo "  Install first:  cd portfolio-frontend && pnpm install" >&2
  exit 1
fi

# Free a port if something is already listening on it, so the frontend always
# lands on 3000 (Nuxt/Vite silently walks to 3001, 3002, … otherwise) and the
# backend on 8000. Kills only LISTENers on these exact loopback ports.
free_port() {
  local port="$1" pids_on_port
  pids_on_port="$(lsof -nP -tiTCP@127.0.0.1:"$port" -sTCP:LISTEN 2>/dev/null || true)"
  if [ -n "$pids_on_port" ]; then
    echo "Port $port busy — clearing stale process(es): $(echo "$pids_on_port" | tr '\n' ' ')"
    # shellcheck disable=SC2086
    kill $pids_on_port 2>/dev/null || true
    sleep 1
    # Anything still holding the port gets SIGKILL.
    pids_on_port="$(lsof -nP -tiTCP@127.0.0.1:"$port" -sTCP:LISTEN 2>/dev/null || true)"
    # shellcheck disable=SC2086
    [ -n "$pids_on_port" ] && kill -9 $pids_on_port 2>/dev/null || true
  fi
}
free_port 3000
free_port 8000

pids=()

# Stop both children (and their descendants, e.g. uvicorn's reloader) on exit.
cleanup() {
  trap - INT TERM EXIT
  echo ""
  echo "Shutting down…"
  for pid in "${pids[@]}"; do
    # Kill the whole process group so child reloaders die too.
    kill -- "-$pid" 2>/dev/null || true
  done
  wait 2>/dev/null || true
}
trap cleanup INT TERM EXIT

# Prefix every line of a stream with a colored label.
prefix() {
  local label="$1" color="$2"
  while IFS= read -r line; do
    printf '%s%s%s %s\n' "$color" "$label" "$C_RESET" "$line"
  done
}

echo "Starting backend (:8000) and frontend (:3000)…  Ctrl+C to stop."

# Each service runs in its own process group (via `set -m` above) so cleanup
# can signal the group. Logs are merged (2>&1) and piped through the prefixer.
(
  cd "$BACKEND"
  # shellcheck disable=SC1091
  source venv/bin/activate
  exec uvicorn app.main:app --reload
) > >(prefix "[backend] " "$C_BACK") 2>&1 &
pids+=($!)

(
  cd "$FRONTEND"
  exec pnpm dev
) > >(prefix "[frontend]" "$C_FRONT") 2>&1 &
pids+=($!)

# Wait for both; if either exits, cleanup (via trap) tears down the other.
wait
