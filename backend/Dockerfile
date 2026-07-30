# Backend Dockerfile for SpeedMotors API
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install dependencies required for Prisma engine and native builds (bcrypt) on Alpine
RUN apk add --no-cache openssl python3 make g++

# Copy package management files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm install

# Generate Prisma Client
RUN npx prisma generate

# Copy source code
COPY . .

# Expose backend API port
EXPOSE 5000

# Environment variables default
ENV PORT=5000
ENV NODE_ENV=production

# Run database schema sync and start server
CMD ["sh", "-c", "npx prisma db push && node prisma/seed.js && node src/server.js"]
