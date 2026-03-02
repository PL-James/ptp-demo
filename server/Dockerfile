FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY src ./src
COPY tsconfig.json ./
COPY drizzle.config.ts ./

EXPOSE 3000

CMD ["npx", "tsx", "src/index.ts"]
