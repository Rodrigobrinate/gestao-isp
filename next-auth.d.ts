// next-auth.d.ts
import NextAuth, { DefaultSession, User as NextAuthUser } from "next-auth"
import { JWT } from "next-auth/jwt"

// Adicione os campos customizados que você precisa na sessão
interface CustomUser {
  id: string;
  role: string;
  localizacao?: { // Adicionando a localização do usuário
    id: string;
    nome: string;
    tipo: string;
  }
}

declare module "next-auth" {
  interface Session {
    user: CustomUser & DefaultSession["user"];
  }
  interface User extends NextAuthUser {
    role: string;
    localizacaoId?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    localizacaoId?: string;
  }
}