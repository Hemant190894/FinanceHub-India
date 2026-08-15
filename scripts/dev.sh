#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [ ! -f .env ]; then
  cp .env.example .env
fi

# shellcheck disable=SC1091
set -a && source .env && set +a

cleanup() {
  trap - INT TERM
  kill 0 2>/dev/null || true
}
trap cleanup INT TERM

echo ""
echo "============================================"
echo "  FinanceHub India — local dev"
echo "============================================"
echo "  Website (open in browser): http://localhost:3000"
echo "  API / docs:                http://localhost:8000/docs"
echo "============================================"
echo ""

if [ ! -d frontend/node_modules ]; then
  echo "→ Frontend deps missing. Run: ./scripts/setup.sh"
  exit 1
fi

if [ ! -d backend/.venv ]; then
  echo "→ Backend venv missing. Run: ./scripts/setup.sh"
  exit 1
fi

echo "→ Starting Postgres (docker)..."
docker compose up -d postgres 2>/dev/null || echo "  (skipped — docker not running or postgres already up)"

echo "→ Starting backend on :8000..."
(
  cd backend
  source .venv/bin/activate 2>/dev/null || true
  uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
) &

echo "→ Starting frontend on :3000..."
(cd frontend && npm run dev) &

sleep 2
echo ""
echo "✓ Open http://localhost:3000 in your browser"
echo ""

wait
