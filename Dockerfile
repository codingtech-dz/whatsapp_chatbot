FROM node:20-bullseye

WORKDIR /app

RUN apt-get update && apt-get install -y \
  chromium \
  ca-certificates \
  fonts-liberation \
  libasound2 \
  libatk-bridge2.0-0 \
  libatk1.0-0 \
  libcups2 \
  libdrm2 \
  libgbm1 \
  libgtk-3-0 \
  libnspr4 \
  libnss3 \
  libx11-6 \
  libx11-xcb1 \
  libxcb1 \
  libxcomposite1 \
  libxdamage1 \
  libxext6 \
  libxfixes3 \
  libxrandr2 \
  libxrender1 \
  libxss1 \
  libxshmfence1 \
  libxtst6 \
  libxkbcommon0 \
  libxi6 \
  libpangocairo-1.0-0 \
  libpango-1.0-0 \
  libcairo2 \
  libglib2.0-0 \
  libdbus-1-3 \
  libfontconfig1 \
  libfreetype6 \
  && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm install

COPY . .

RUN npx prisma generate

ENV NODE_ENV=production
ENV WA_CHROME_PATH=/usr/bin/chromium
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
ENV CHROME_BIN=/usr/bin/chromium
ENV WA_SESSION_PATH=/var/data/openwa-sessions

RUN npm run build

EXPOSE 3000

RUN useradd -m appuser && mkdir -p /var/data && chown -R appuser:appuser /app /var/data
USER appuser

CMD ["npm", "run", "start"]
