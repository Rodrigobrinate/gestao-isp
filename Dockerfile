# === ESTÁGIO 1: BUILDER ===
# Este estágio instala todas as dependências e compila o projeto.
FROM node:18-alpine AS builder

ENV NODE_ENV=production
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npx prisma generate
RUN npm run build


# === ESTÁGIO 2: RUNNER (PRODUÇÃO) ===
# Este estágio instala apenas as dependências de produção e copia o build final.
FROM node:18-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Cria um usuário com menos privilégios para segurança
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copia apenas o package.json para instalar somente as dependências de produção
COPY --from=builder /app/package*.json ./

# Instala SOMENTE as dependências de produção
# 'npm ci' é mais rápido e seguro para produção do que 'npm install'
RUN npm ci --omit=dev

# Copia os arquivos da aplicação compilada do estágio anterior
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# Define o usuário que irá rodar o processo
USER nextjs

EXPOSE 3000

# O comando para iniciar a aplicação agora usa o script "start" do package.json
CMD ["npm", "start"]