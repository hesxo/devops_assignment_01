FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY src ./src

RUN mkdir -p /app/data

ENV NODE_ENV=production PORT=3000 FILE_PATH=/app/data/data.txt

EXPOSE 3000

CMD ["node", "src/index.js"]