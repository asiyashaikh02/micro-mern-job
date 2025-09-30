FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production || true
COPY . .
ENV NODE_ENV=production
EXPOSE 3002
CMD ["node", "main.js"]
