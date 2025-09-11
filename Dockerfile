# === ESTÁGIO 1: BUILDER ===
# Este estágio instala dependências, gera o client do Prisma e compila o projeto.
# Usamos uma imagem Node.js baseada em Alpine por ser leve.
FROM node:18-alpine AS builder

# Define o ambiente para produção (importante para o build do Next.js)
ENV NODE_ENV=production

# Define o diretório de trabalho dentro do container
WORKDIR /app

# Copia os arquivos de gerenciamento de pacotes
COPY package*.json ./

# Instala todas as dependências (incluindo as de desenvolvimento para o build)
RUN npm install

# Copia todo o código-fonte do projeto
COPY . .

# Garante que o Prisma Client seja gerado com base no seu schema
# Isso é essencial para o build funcionar corretamente
RUN npx prisma generate

# Executa o build da aplicação Next.js
RUN npm run build


# === ESTÁGIO 2: RUNNER (PRODUÇÃO) ===
# Este é o estágio final, que resultará na imagem de produção.
# Ele é super leve e contém apenas o necessário para rodar a aplicação.
FROM node:18-alpine AS runner

WORKDIR /app

# Define o ambiente para produção
ENV NODE_ENV=production

# Cria um usuário e grupo com menos privilégios para rodar a aplicação (boa prática de segurança)
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copia os arquivos da aplicação otimizada do estágio 'builder'
# Graças ao `output: 'standalone'`, isso inclui a pasta `public`, o `server.js` e as dependências de produção.
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Define o usuário que irá rodar a aplicação
USER nextjs

# Expõe a porta que o Next.js usa por padrão
EXPOSE 3000

# Define o comando para iniciar o servidor
# O `output: 'standalone'` cria um `server.js` otimizado.
CMD ["node", "server.js"]