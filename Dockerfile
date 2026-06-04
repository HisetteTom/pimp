FROM oven/bun:1 AS dependencies
WORKDIR /app
COPY package.json bun.lock* ./
RUN --mount=type=cache,target=/root/.bun/install/cache \
  bun install --frozen-lockfile

FROM oven/bun:1 AS builder
WORKDIR /app
ARG NEXT_PUBLIC_BASE_PATH
ENV NEXT_PUBLIC_BASE_PATH=$NEXT_PUBLIC_BASE_PATH
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
ENV NODE_ENV=production
ENV DATABASE_URL="postgres://dummy:dummy@localhost:5432/dummy"
ENV BETTER_AUTH_SECRET="dummy_secret_key_minimum_length_32_characters"
ENV BETTER_AUTH_URL="http://localhost:3000"
RUN bun run build

FROM oven/bun:1 AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

COPY --from=builder --chown=bun:bun /app/public ./public

RUN mkdir .next && chown bun:bun .next

COPY --from=builder --chown=bun:bun /app/.next/standalone ./
COPY --from=builder --chown=bun:bun /app/.next/static ./.next/static
COPY --from=builder --chown=bun:bun /app/drizzle.config.ts ./drizzle.config.ts
COPY --from=builder --chown=bun:bun /app/src/db ./src/db
COPY --from=builder --chown=bun:bun /app/drizzle ./drizzle

COPY --from=builder --chown=bun:bun /app/node_modules ./node_modules

USER bun

EXPOSE 3000

CMD ["bun", "server.js"]
