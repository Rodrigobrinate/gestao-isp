# Dockerfile

# --- Estágio 1: Builder ---
# Este estágio instala dependências, gera o client do Prisma e constrói a aplicação Next.js
FROM node:18-alpine AS builder

# Define o diretório de trabalho dentro do container
WORKDIR /app

# Instala o openssl, necessário para o Prisma
RUN apk add --no-cache openssl

# Copia os arquivos de gerenciamento de pacotes
COPY package.json package-lock.json ./

# Instala as dependências de forma limpa a partir do lockfile
# `npm ci` é a melhor prática para builds consistentes
RUN npm ci

# Copia o restante do código da aplicação
COPY . .

# Gera o Prisma Client com base no schema e nos binários corretos
RUN npx prisma generate

# Constrói a aplicação Next.js para produção
RUN npm run build

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
COPY --from=builder /app/package-lock.json ./package-lock.json

# Instala APENAS as dependências de produção
# `--omit=dev` é o equivalente moderno de `--production`
RUN npm ci --omit=dev

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
# `npm start` irá executar o script "start" definido no seu package.json
CMD ["npm", "start"]