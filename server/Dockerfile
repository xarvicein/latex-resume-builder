FROM node:20-bookworm-slim AS base

# --- Tectonic (self-contained LaTeX binary, no TeX Live needed) ---
# We pin a specific release and use the musl-linked build, which is *statically linked*.
# This avoids missing shared libraries (libgraphite2, libharfbuzz, etc.) and glibc
# version mismatches between the CI machine that built the binary and this image's glibc.
#
# fontconfig is still required at runtime even with the static binary: Tectonic's XeTeX
# engine dlopens libfontconfig to discover fonts, and needs /etc/fonts/fonts.conf plus an
# actual font cache to exist on disk, or it fails with "Cannot load default config file".
# We install fontconfig + a small base font set and build the cache with fc-cache.
ARG TECTONIC_VERSION=0.16.9
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates curl \
    fontconfig \
    fonts-liberation \
    fonts-dejavu-core \
    && curl -L -o /tmp/tectonic.tar.gz \
    "https://github.com/tectonic-typesetting/tectonic/releases/download/tectonic%40${TECTONIC_VERSION}/tectonic-${TECTONIC_VERSION}-x86_64-unknown-linux-musl.tar.gz" \
    && tar -xzf /tmp/tectonic.tar.gz -C /usr/local/bin \
    && chmod +x /usr/local/bin/tectonic \
    && rm /tmp/tectonic.tar.gz \
    && fc-cache -f -v \
    && apt-get purge -y curl \
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