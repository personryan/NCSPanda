# Dockerfile (backend)

FROM node:20-bookworm-slim AS base
WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/*

COPY backend/package*.json ./
RUN npm ci

COPY backend/prisma ./prisma
RUN npx prisma generate
COPY backend/tsconfig.json ./
COPY backend/src ./src

# ---- variant with corporate cert ----
FROM base AS with-cert
COPY zcaler.crt.cer /usr/local/share/ca-certificates/zcaler.crt.cer
ENV NODE_EXTRA_CA_CERTS=/usr/local/share/ca-certificates/zcaler.crt.cer

CMD ["npm", "run", "start:dev"]

# ---- default dev variant without cert ----
FROM base AS no-cert
CMD ["npm", "run", "start:dev"]

# ---- production build ----
FROM base AS build
RUN npm run build

# ---- production dependencies ----
FROM node:20-bookworm-slim AS prod-deps
WORKDIR /app

COPY backend/package*.json ./
RUN npm ci --omit=dev --ignore-scripts && npm cache clean --force

# ---- built runtime ----
FROM node:20-bookworm-slim AS runtime
WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/*

COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build /app/node_modules/@prisma/client ./node_modules/@prisma/client
COPY --from=build /app/dist ./dist
COPY backend/package*.json ./

EXPOSE 3000
CMD ["npm", "start"]
