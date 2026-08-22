# ====================================================
# Stage 1: Install dependencies
# ====================================================
FROM node:20-alpine AS deps
WORKDIR /app

# Install libc compatibility cho sharp và native modules
RUN apk add --no-cache libc6-compat

# Copy package files
COPY package.json package-lock.json* ./

# Install production + dev dependencies (cần devDeps để build)
RUN npm ci

# ====================================================
# Stage 2: Build Next.js application
# ====================================================
FROM node:20-alpine AS builder
WORKDIR /app

# Copy deps từ stage 1
COPY --from=deps /app/node_modules ./node_modules

# Copy toàn bộ source code frontend
COPY . .

# Tắt Next.js telemetry khi build
ENV NEXT_TELEMETRY_DISABLED=1

# Build production bundle (tạo .next/standalone nhờ output: 'standalone' trong next.config.ts)
RUN npm run build

# ====================================================
# Stage 3: Runtime (image nhẹ nhất, chỉ chứa standalone bundle)
# ====================================================
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Tạo non-root user để tăng bảo mật
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

# Copy static assets & standalone bundle từ builder stage
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Chạy Next.js standalone server (server.js được tạo tự động)
CMD ["node", "server.js"]
