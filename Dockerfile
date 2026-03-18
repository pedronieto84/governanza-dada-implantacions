FROM node:22-slim

RUN npm install -g portless

WORKDIR /app

COPY package.json ./
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/

RUN npm run install:all

COPY . .

# Portless proxy + both apps
CMD ["sh", "-c", "portless proxy start && npx concurrently 'npm run start:backend' 'npm run start:frontend'"]
