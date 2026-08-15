#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "→ Installing frontend dependencies..."
(cd frontend && npm install)

echo "→ Installing backend dependencies..."
python3 -m venv backend/.venv
source backend/.venv/bin/activate
pip install -r backend/requirements.txt

if [ ! -f .env ]; then
  cp .env.example .env
  echo "→ Created .env from .env.example"
fi

echo "✓ Setup complete. Run: ./scripts/dev.sh"
