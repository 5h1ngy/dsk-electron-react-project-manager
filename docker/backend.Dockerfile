FROM node:22-alpine AS builder

WORKDIR /app

# bring in the real project files for compilation
COPY packages ./packages
# install only the dependencies required to build the backend (no electron postinstall)
COPY docker/backend.dev.package.json ./package.json
COPY package-lock.json ./

RUN npm install
RUN npm run build:backend

FROM node:22-alpine

ARG API_PORT=0000
WORKDIR /app

# install slim runtime dependencies for the backend service
COPY docker/backend.prod.package.json ./package.json
COPY package-lock.json ./
RUN npm install --omit=dev

COPY --from=builder /app/out/backend/packages ./
COPY packages/backend/tsconfig.backend.prod.json ./backend/tsconfig.json

EXPOSE ${API_PORT}

CMD ["node", "--experimental-default-type=commonjs", "-r", "module-alias/register", "-r", "tsconfig-paths/register", "out/backend/packages/backend/src/server.js"]
