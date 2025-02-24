# Build stage
FROM node:18-alpine AS builder

# Install pnpm
RUN corepack enable && corepack prepare pnpm@8 --activate

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source files
COPY . .

# Build application
RUN pnpm build

# Production stage
FROM node:18-alpine

# Install pnpm
RUN corepack enable && corepack prepare pnpm@8 --activate

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install production dependencies
RUN pnpm install --prod --frozen-lockfile

# Copy built application
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/config ./src/config

# Set environment variables
ENV NODE_ENV=production

# Expose port
EXPOSE 3000

# Start application
CMD ["pnpm", "start"] 