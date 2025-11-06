FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig*.json ./
COPY electron.vite.config.ts ./
COPY packages ./packages

RUN npm run build:api

FROM node:22-alpine

ENV NODE_ENV=production
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/out/api ./out/api

EXPOSE 3333

CMD ["node", "-r", "tsconfig-paths/register", "out/api/api/server.js"]
