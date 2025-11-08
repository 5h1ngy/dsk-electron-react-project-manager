FROM node:22-alpine AS builder

WORKDIR /app

# install only the dependencies required to build the backend (no electron postinstall)
COPY docker/backend.dev.package.json ./package.json
RUN npm install

# bring in the real project files for compilation
COPY package.json package-lock.json ./
COPY packages ./packages

RUN npm run build:backend

FROM node:22-alpine

ENV NODE_ENV=production
ENV TS_NODE_PROJECT=packages/backend/tsconfig.backend.json
ENV TS_NODE_BASEURL=out/backend
WORKDIR /app

# install slim runtime dependencies for the backend service
COPY docker/backend.prod.package.json ./package.json
RUN npm install --omit=dev

COPY packages/backend/tsconfig.backend.json ./packages/backend/tsconfig.backend.json
COPY --from=builder /app/out/backend ./out/backend

EXPOSE 3333

CMD ["node", "--experimental-default-type=commonjs", "-r", "module-alias/register", "-r", "tsconfig-paths/register", "out/backend/packages/backend/src/server.js"]
