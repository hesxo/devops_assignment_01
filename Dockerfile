FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY src ./src

ENV PORT=3000
ENV FILE_PATH=/app/data/data.txt

EXPOSE 3000

CMD ["node", "src/index.js"]
