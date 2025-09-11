# === ESTÁGIO 1: BUILDER ===
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./

# 1. Primeiro, instala TODAS as dependências (de desenvolvimento e produção)
RUN npm install

# 2. Depois, copia o resto do código
COPY . .

# 3. AGORA, define o ambiente como produção para o build
ENV NODE_ENV=production

# 4. Roda os comandos de build
RUN npx prisma generate
RUN npm run build