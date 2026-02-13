FROM node:20-bullseye

WORKDIR /app

RUN apt-get update && apt-get install -y \
  chromium \
  fonts-liberation \
  libasound2 \
  libatk-bridge2.0-0 \
  libatk1.0-0 \
  libcups2 \
  libdrm2 \
  libgbm1 \
  libgtk-3-0 \
  libnss3 \
  libx11-xcb1 \
  libxcomposite1 \
  libxdamage1 \
  libxrandr2 \
  libxss1 \
  libxkbcommon0 \
  libxshmfence1 \
  libpango-1.0-0 \
  libpangocairo-1.0-0 \
  libxinerama1 \
  libxcursor1 \
  libxext6 \
  libxi6 \
  libxtst6 \
  ca-certificates \
  && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm install

COPY . .

RUN npx prisma generate

ENV NODE_ENV=production
ENV WA_CHROME_PATH=/usr/bin/chromium
ENV WA_SESSION_PATH=/var/data/openwa-sessions

RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start"]
