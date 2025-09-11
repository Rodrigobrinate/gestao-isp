# === ESTÁGIO 1: BUILDER ===
# Este estágio instala todas as dependências e compila o projeto.
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./

# 1. Primeiro, instala TODAS as dependências (de desenvolvimento e produção)
RUN npm install

# 2. Depois, copia o resto do código
COPY . .

# 3. AGORA, define o ambiente como produção para o build
ENV NODE_ENV=production

# 4. Roda os comandos de build, incluindo o Prisma Generate
#    (Lembre-se de ter corrigido o schema.prisma com os binaryTargets)
# Declare the build argument
ARG DATABASE_URL

# Make the argument available as an environment variable for subsequent commands
ENV DATABASE_URL=$DATABASE_URL
RUN npx prisma db push
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
RUN npm ci --omit=dev
COPY --from=builder /app/node_modules/.prisma/client ./node_modules/.prisma/client

# Copia os arquivos da aplicação compilada do estágio anterior
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# Define o usuário que irá rodar o processo
USER nextjs

EXPOSE 3000

# ============================================================================
# AQUI ESTÁ A INSTRUÇÃO:
# Define o comando padrão para iniciar o container, que é "npm start".
# ============================================================================
CMD ["npm", "start"]