# ============================
# Build Stage
# ============================

FROM node:20-bookworm AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npx prisma generate

RUN npm run build


# ============================
# Runtime Stage
# ============================

FROM node:20-bookworm AS runtime

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/dist ./dist

EXPOSE 4000

CMD ["node", "dist/server.js"]