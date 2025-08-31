FROM node:22-bookworm-slim

WORKDIR /usr/src/app

RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Build arg for cache busting
ARG DEPS_HASH=none
ENV DEPS_HASH=$DEPS_HASH

# Copy manifests
COPY package.json ./

# Clean install every time deps change
RUN rm -rf node_modules package-lock.json && npm install --no-audit --no-fund

# Copy rest
COPY tsconfig.json ./
COPY src ./src
COPY prisma ./prisma

# Prisma client
RUN npx prisma format
RUN npx prisma generate

EXPOSE 3001

CMD ["sh", "-c", "npx prisma migrate deploy && node --import tsx src/server.ts"]
