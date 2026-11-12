# syntax=docker/dockerfile:1
FROM node:22-bookworm-slim AS dependencies
WORKDIR /app
COPY package.json package-lock.json ./
RUN --mount=type=cache,id=inceptchange-npm,target=/root/.npm,sharing=locked npm ci

FROM dependencies AS build
COPY svelte.config.js vite.config.ts tsconfig.json ./
COPY src ./src
COPY static ./static
COPY scripts/optimize_images.mjs scripts/optimize_hero_images.mjs ./scripts/
RUN npm run check && npm run build
# Only optimized photographs are needed in the production image.
RUN find build/client/images/studio build/client/images/hero -maxdepth 1 -type f \( -iname '*.jpg' -o -iname '*.jpeg' -o -iname '*.png' \) -delete

FROM node:22-bookworm-slim AS production-dependencies
WORKDIR /app
COPY package.json package-lock.json ./
RUN --mount=type=cache,id=inceptchange-npm,target=/root/.npm,sharing=locked npm ci --omit=dev --ignore-scripts

FROM node:22-bookworm-slim AS runtime
ENV NODE_ENV=production HOST=0.0.0.0 PORT=3000
WORKDIR /app
COPY --from=production-dependencies --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/build ./build
COPY --chown=node:node package.json ./
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 CMD node -e "fetch('http://127.0.0.1:3000/healthz').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "build"]
