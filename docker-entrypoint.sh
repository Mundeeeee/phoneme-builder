#!/bin/sh
set -e

echo "Applying database schema..."
# --accept-data-loss: this runs non-interactively (no TTY inside the
# container), so if a schema change would normally prompt "are you sure?",
# there is nothing to answer that prompt and the process would otherwise
# hang forever waiting for input that never comes. This is fine for this
# project's disposable local/demo SQLite database.
npx prisma db push --skip-generate --accept-data-loss

echo "Seeding database (skipped automatically if data already exists)..."
node prisma/seed.js || true

echo "Starting application..."
exec "$@"
