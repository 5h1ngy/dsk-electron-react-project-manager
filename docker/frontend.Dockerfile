FROM node:22-alpine AS builder

ARG VITE_API_BASE_URL=http://localhost:3333
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig*.json ./
COPY electron.vite.config.ts ./
COPY packages ./packages

RUN npm run build:frontend

FROM nginx:1.27-alpine

COPY docker/frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/out/renderer-web /usr/share/nginx/html

EXPOSE 80
