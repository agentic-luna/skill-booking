# ============================
# Build Stage
# ============================
FROM node:20-bookworm AS builder

WORKDIR /app

RUN npm config set registry https://registry.yarnpkg.com/

COPY package*.json ./

RUN npm ci

ENV NODE_TLS_REJECT_UNAUTHORIZED=0

COPY . .

RUN npx prisma generate

RUN npm run build

# ============================
# Runtime Stage
# ============================
FROM node:20-bookworm

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/dist ./dist

EXPOSE 4000

CMD ["node", "dist/server.js"]