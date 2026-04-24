# Dockerfile (backend)

ARG USE_CORP_CERT=false

FROM node:20 AS base
WORKDIR /app

COPY backend/package*.json ./

RUN npm install

COPY backend/prisma ./prisma
RUN NODE_TLS_REJECT_UNAUTHORIZED=0 npx prisma generate
COPY backend/tsconfig.json ./
COPY backend/src ./src

# ---- variant with corporate cert ----
FROM base AS with-cert
COPY zcaler.crt.cer /usr/local/share/ca-certificates/zcaler.crt.cer
ENV NODE_EXTRA_CA_CERTS=/usr/local/share/ca-certificates/zcaler.crt.cer

CMD ["npm", "run", "start:dev"]

# ---- default variant without cert ----
FROM base AS no-cert
CMD ["npm", "run", "start:dev"]

# ---- built runtime ----
FROM base AS runtime
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
