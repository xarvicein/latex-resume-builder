FROM node:20-bookworm-slim AS base

# --- Tectonic (self-contained LaTeX *binary*, no TeX Live needed) ---
# curl/xz-utils are only needed to fetch+extract the binary, so they get purged after.
# libgraphite2/libharfbuzz/libfontconfig/libicu are dynamic libraries tectonic links
# against at *runtime* to do text shaping/font handling — these must stay installed,
# or tectonic fails at startup with "error while loading shared libraries".
RUN apt-get update && apt-get install -y --no-install-recommends \
      ca-certificates curl xz-utils \
      libgraphite2-3 libharfbuzz0b libfontconfig1 libicu72 libssl3 zlib1g \
    && curl --proto '=https' --tlsv1.2 -fsSL https://drop-sh.fullyjustified.net | sh \
    && mv tectonic /usr/local/bin/tectonic \
    && apt-get purge -y curl xz-utils \
    && apt-get autoremove -y \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# --- install deps first for better layer caching ---
COPY package*.json ./
RUN npm install

# --- build TypeScript ---
COPY . .
RUN npm run build

# Pre-warm Tectonic's package cache so the first real compile isn't slow (best-effort).
RUN mkdir -p /tmp/warm && cd /tmp/warm && \
    printf '\\documentclass{article}\\begin{document}warmup\\end{document}' > main.tex && \
    (tectonic -X compile main.tex || true) && \
    rm -rf /tmp/warm

ENV NODE_ENV=production
ENV PORT=4000
ENV LATEX_ENGINE=tectonic
EXPOSE 4000

CMD ["node", "dist/index.js"]
