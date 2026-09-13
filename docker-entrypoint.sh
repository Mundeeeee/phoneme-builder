#!/bin/sh
set -e

echo "Applying database schema..."
# --accept-data-loss: avoids hanging on a confirmation prompt with no TTY to answer it.
npx prisma db push --skip-generate --accept-data-loss

echo "Seeding database (skips automatically if data already exists)..."
node prisma/seed.js || true

echo "Starting application..."
exec "$@"
