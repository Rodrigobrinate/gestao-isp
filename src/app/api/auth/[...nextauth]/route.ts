// app/api/auth/[...nextauth]/route.ts

import NextAuth from "next-auth"; // 1. IMPORTE O TIPO AuthOptions
//import  AuthOptions  from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

// 2. ADICIONE A TIPAGEM AQUI -> : AuthOptions
const authOptions: any = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        username: { label: "Usuário", type: "text" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          throw new Error("Dados de login inválidos");
        }

        const user = await prisma.user.findUnique({
          include: {
            empresa: {
              select: {
                id: true,
                nome: true,
                holdingId: true,
              },
            },
          },
          where: {
            username: credentials.username,
          },
        });
        console.log(user);
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
        function a() {
          return password;
        }
        return userWithoutPassword;
      },
    }),
  ],
  session: {
    strategy: "jwt", // Agora o TypeScript entende que "jwt" é um valor válido aqui
  },
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.id = user.id;
        // @ts-ignore
        token.role = user.role;
        token.empresa = user.empresa;
        //token.empresa.holdingId = user.empresa.holdingId;
        token.empresaId = user.empresaId;
        // @ts-ignore
        token.localizacaoId = user.localizacaoId;
      }
      return token;
    },
    async session({ session, token }: any) {
      // @ts-ignore
      if (session?.user) {
        // @ts-ignore
        session.user.id = token.id;
        // @ts-ignore
        session.user.role = token.role;
        //session.user.empresa.holdingId = token.empresa.holdingId;
        session.user.empresa = token.empresa;
        session.user.empresaId = token.empresaId;
        session.user.localizacaoId = token.localizacaoId;
        // Busca a localização e anexa à sessão
        if (token.localizacaoId) {
          const localizacao = await prisma.localizacao.findUnique({
            where: { id: token.localizacaoId as string },
          });
          // @ts-ignore
          session.user.localizacao = localizacao;
        }
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};
// @ts-ignore
const handler = NextAuth(authOptions) as any;

export { handler as GET, handler as POST, authOptions };
