FROM node:24-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npx tsc
EXPOSE 4002
CMD ["node", "dist/index.js"]