FROM node:22-alpine AS builder

WORKDIR /app

# install only the dependencies required to build the API (no electron postinstall)
COPY docker/node/api.package.json ./package.json
RUN npm install

# bring in the real project files for compilation
COPY package.json package-lock.json ./
COPY packages ./packages

RUN npm run build:api

FROM node:22-alpine

ENV NODE_ENV=production
ENV TS_NODE_PROJECT=packages/electron/tsconfig.node.json
ENV TS_NODE_BASEURL=out/api
WORKDIR /app

# install slim runtime dependencies for the API service
COPY docker/node/api.package.json ./package.json
RUN npm install --omit=dev

COPY packages/electron/tsconfig.node.json ./packages/electron/tsconfig.node.json
COPY --from=builder /app/out/api ./out/api

EXPOSE 3333

CMD ["node", "--experimental-default-type=commonjs", "-r", "module-alias/register", "-r", "tsconfig-paths/register", "out/api/packages/api/src/server.js"]
