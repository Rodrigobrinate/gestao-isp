# Dockerfile

# --- Estágio 1: Builder ---
# Este estágio instala dependências, gera o client do Prisma e constrói a aplicação Next.js
FROM node:18-alpine AS builder

# Define o diretório de trabalho dentro do container
WORKDIR /app

# Instala o openssl, necessário para o Prisma
RUN apk add --no-cache openssl

# Copia os arquivos de gerenciamento de pacotes
COPY package.json yarn.lock ./
# Se você usa npm ou pnpm, ajuste os arquivos copiados (ex: package-lock.json)

# Instala as dependências de produção e desenvolvimento
RUN yarn install --frozen-lockfile

# Copia o restante do código da aplicação
COPY . .

# Gera o Prisma Client com base no schema e nos binários corretos
RUN npx prisma generate

# Constrói a aplicação Next.js para produção
RUN yarn build

# --- Estágio 2: Runner ---
# Este é o estágio final, que cria a imagem de produção, leve e otimizada.
FROM node:18-alpine AS runner

WORKDIR /app

# Define o ambiente como produção
ENV NODE_ENV=production

# Cria um usuário não-root para rodar a aplicação por segurança
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copia os arquivos de dependência
COPY --from=builder /app/package.json ./package.json

# Copia o lockfile (opcional mas bom para consistência)
COPY --from=builder /app/yarn.lock ./yarn.lock

# Instala APENAS as dependências de produção
RUN yarn install --production --frozen-lockfile

# Copia a build da aplicação do estágio anterior
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder /app/public ./public

# Copia o schema do Prisma e o client gerado para a imagem final
# Isso é necessário para o Prisma funcionar em produção
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma


# Muda para o usuário não-root
USER nextjs

# Expõe a porta que a aplicação vai rodar
EXPOSE 3000

# Comando para iniciar a aplicação
# `npx next start` é o comando padrão para iniciar um servidor Next.js em produção
CMD ["yarn", "start"]