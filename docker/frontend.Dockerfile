FROM node:22-alpine AS builder

ARG VITE_API_BASE_URL=/api
ARG VITE_PUBLIC_BASE=/
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_PUBLIC_BASE=$VITE_PUBLIC_BASE

WORKDIR /app

COPY packages ./packages
COPY docker/frontend.package.dev.json ./package.json
COPY package-lock.json ./
RUN npm install

COPY package.json ./package.json
RUN npm run build:frontend

FROM nginx:1.27-alpine
ARG WEB_PORT=0000

COPY docker/frontend.nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/out/renderer-web /usr/share/nginx/html

EXPOSE ${WEB_PORT}
