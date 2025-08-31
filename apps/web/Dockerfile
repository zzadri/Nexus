FROM node:22.19.0-trixie-slim

WORKDIR /usr/src/app

COPY package.json ./
# COPY package-lock.json ./  # uncomment if you add a lockfile later
RUN npm install --no-audit --no-fund

COPY index.html ./
COPY vite.config.ts ./
COPY tsconfig.json ./
COPY postcss.config.cjs ./
COPY tailwind.config.cjs ./
COPY src ./src

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
