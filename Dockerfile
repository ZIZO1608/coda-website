# Stage 1: pre-render the pages (no npm dependencies needed)
FROM node:22-alpine AS build
WORKDIR /app
# SITE_URL from Coolify overrides the default; an empty value also falls back to the live domain
ARG SITE_URL
COPY . .
RUN SITE_URL="${SITE_URL:-https://coda-media.com}" node build.mjs

# Stage 2: serve the static files
FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s --retries=3 CMD wget -q -O /dev/null http://127.0.0.1/ || exit 1
