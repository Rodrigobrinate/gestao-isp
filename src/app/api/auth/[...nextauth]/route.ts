// app/api/auth/[...nextauth]/route.ts

import NextAuth, { AuthOptions } from "next-auth"; // 1. IMPORTE O TIPO AuthOptions
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

// 2. ADICIONE A TIPAGEM AQUI -> : AuthOptions
export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "text", placeholder: "jsmith@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Dados de login inválidos");
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        });

        if (!user || !user.password) {
          throw new Error("Usuário não encontrado ou não cadastrado com senha");
        }

        const isPasswordCorrect = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordCorrect) {
          throw new Error("Senha incorreta");
        }
        
        // Retorna o usuário sem a senha
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      },
    }),
  ],
  session: {
    strategy: "jwt", // Agora o TypeScript entende que "jwt" é um valor válido aqui
  },
    callbacks: {
        async jwt({ token, user }) {
            // Ao fazer login, adiciona o 'role' do usuário ao token
            if (user) {
                // @ts-ignore
                token.role = user.role;
            }
            return token;
        },
        async session({ session, token }) {
            // Disponibiliza o 'role' do token para a sessão do cliente
            if (session?.user) {
                // @ts-ignore
                session.user.role = token.role;
            }
            return session;
        },
    },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };