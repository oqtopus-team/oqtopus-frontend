# syntax=docker/dockerfile:1

ARG BUN_VERSION=1

###############################################################################
# install: install dependencies (cached unless the lockfile changes)
###############################################################################
FROM oven/bun:${BUN_VERSION} AS install

WORKDIR /workspace

COPY package.json bun.lock bunfig.toml ./
# --ignore-scripts: skip native postinstall builds (e.g. tree-sitter).
# Those are Node-side native bindings that are never used in the browser
# bundle (Vite falls back to the WASM web-tree-sitter), so building them is
# unnecessary. They also fail to compile against Node 24's C++20 V8 headers
# (tree-sitter@0.21 does not request C++20).
RUN bun install --frozen-lockfile --ignore-scripts


###############################################################################
# development: Vite dev server (HMR). Used via a compose bind mount.
###############################################################################
FROM oven/bun:${BUN_VERSION} AS development

WORKDIR /workspace

# Bring in the Linux node_modules built in the install stage. It is independent
# of the host's node_modules (macOS binaries), so the host `bun run dev` and
# Docker can coexist without breaking each other.
COPY --from=install /workspace/node_modules ./node_modules

# Vite's default port
EXPOSE 5173

# --host: bind to 0.0.0.0 so the dev server is reachable from outside the container
CMD ["bun", "run", "dev", "--host"]


###############################################################################
# build: produce the static assets in /workspace/dist
###############################################################################
FROM install AS build

WORKDIR /workspace

COPY . .
RUN bun run build


###############################################################################
# production: serve the generated static assets
###############################################################################
FROM oven/bun:${BUN_VERSION} AS production

WORKDIR /app

# Install serve (a static file server) globally
RUN bun add -g serve

# Copy the static assets
COPY --from=build /workspace/dist ./dist

EXPOSE 3000

# -s: SPA fallback (return index.html for deep links like /jobs/:id on direct access/reload)
CMD ["serve", "-s", "dist", "-l", "3000"]
