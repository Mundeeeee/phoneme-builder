# HCE Phoneme Activity Builder - Dockerfile
#
# A straightforward single-stage build: install dependencies (which also
# generates the Prisma client via the postinstall script), build the
# Next.js app, then start it. The entrypoint script pushes the Prisma
# schema to the SQLite database and seeds it on first run before starting
# the server, so `docker run` alone is enough to get a working app.

FROM node:20-alpine

WORKDIR /app

# Alpine's musl libc doesn't ship OpenSSL the way Prisma's engine binaries
# expect. Without this, Prisma prints "failed to detect the libssl/openssl
# version" warnings and the schema engine crashes outright (its error
# output isn't valid JSON, which is what causes the "Could not parse
# schema engine response" failure during `prisma db push`). Installing
# openssl here, before `npm install` runs `prisma generate`, ensures the
# right engine binaries are fetched and available at runtime.
RUN apk add --no-cache openssl

ENV NODE_ENV=production
ENV DATABASE_URL="file:/app/prisma/dev.db"
ENV PORT=3000

# Install dependencies first so this layer is cached unless package*.json
# or the Prisma schema changes.
COPY package.json package-lock.json* ./
COPY prisma ./prisma
RUN npm install

# Copy the rest of the source and build the production bundle.
COPY . .
RUN npm run build

EXPOSE 3000

# Docker-level health check hitting the /health route required by the
# assessment brief.
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

RUN chmod +x ./docker-entrypoint.sh
ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["npm", "start"]
