# Single-stage build: install deps, build, run. Entrypoint applies the
# DB schema and seeds data on container start.

FROM node:20-alpine

WORKDIR /app
RUN mkdir -p /app/data

# Needed for Prisma engines to run on Alpine's musl libc.
RUN apk add --no-cache openssl

ENV NODE_ENV=production
ENV DATABASE_URL="file:/app/data/dev.db"
ENV PORT=3000

COPY package.json package-lock.json* ./
COPY prisma ./prisma
RUN npm install

COPY . .
RUN npm run build

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

RUN chmod +x ./docker-entrypoint.sh
ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["npm", "start"]
