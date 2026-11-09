# The website as a small nginx image: the page at /, its files under /site/.
# The front nginx on the server sends those two to this container and the
# rest of the address to the sync server.

FROM node:24-trixie-slim@sha256:54f84b4cf8432b21aaffd5d3ce8d41e12cea0d10d33c09d2f3c9879d49d6b446 AS build
# git for the theme package, which comes from Ficelle's repository
RUN apt-get update && apt-get install -y --no-install-recommends git ca-certificates \
    && rm -rf /var/lib/apt/lists/*
RUN corepack enable
WORKDIR /src
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

FROM nginxinc/nginx-unprivileged:stable-alpine@sha256:f5116ed4606f3eb015dd4a8e28cb9b351476dc0ad4bc6e9f93b19cec130cdf03
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY deploy/headers.inc /etc/nginx/headers.inc
COPY --from=build /src/dist/index.html /usr/share/nginx/html/index.html
COPY --from=build /src/dist/ /usr/share/nginx/html/site/
EXPOSE 8080
