FROM node:20-alpine AS base

WORKDIR /app
ENV NODE_ENV=development

# Install dependencies
COPY frontend/package*.json ./
RUN npm install

# App source
COPY frontend ./

EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]

# ----- variant with corporate cert -----
FROM base AS with-cert
COPY zcaler.crt.cer /usr/local/share/ca-certificates/zcaler.crt.cer
ENV NODE_EXTRA_CA_CERTS=/usr/local/share/ca-certificates/zcaler.crt.cer

# ----- variant without cert (default) -----
FROM base AS no-cert