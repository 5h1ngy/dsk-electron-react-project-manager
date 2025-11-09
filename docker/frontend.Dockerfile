FROM node:22-alpine AS builder

WORKDIR /app

COPY packages ./packages
COPY env ./env
COPY docker/frontend.package.dev.json ./package.json
COPY package-lock.json ./
RUN npm install

COPY package.json ./package.json
RUN npm run build:frontend

FROM nginx:1.27-alpine

COPY docker/frontend.nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/out/renderer-web /usr/share/nginx/html

EXPOSE 80
