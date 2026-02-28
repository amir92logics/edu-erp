# Production Dockerfile for Next.js with Puppeteer (WhatsApp support)
FROM node:20

# 1. Install Chromium and system dependencies for Puppeteer
RUN apt-get update && apt-get install -y \
    chromium \
    fonts-ipafont-gothic \
    fonts-wqy-zenhei \
    fonts-thai-tlwg \
    fonts-kacst \
    fonts-freefont-ttf \
    libxss1 \
    libnss3 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libxkbcommon0 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    libgbm1 \
    libasound2 \
    libpangocairo-1.0-0 \
    libpango-1.0-0 \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# 2. Set environment variables for Puppeteer
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

WORKDIR /app

# 3. Copy EVERYTHING first so Prisma schema is guaranteed to be there
COPY . .

# 4. Install dependencies
# Using --legacy-peer-deps for Next.js 16 / React 19 compatibility
RUN npm install --legacy-peer-deps

# 5. Generate Prisma Client (Schema is now definitely in /app/prisma/schema.prisma)
RUN npx prisma generate

# 6. Build Next.js
RUN npm run build

# 7. Expose port and start
EXPOSE 3000
CMD ["npm", "start"]
