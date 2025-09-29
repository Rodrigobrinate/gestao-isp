import { NextResponse } from 'next/server';
import prisma from '@/src/app/lib/prisma'; // Importa nossa instância única do Prisma
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, cnpj } = body;

    // --- 1. Validação dos Dados de Entrada ---
    if (!name || !email || !password || !cnpj) {
      return NextResponse.json(
        { message: 'Todos os campos são obrigatórios.' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { message: 'A senha deve ter no mínimo 8 caracteres.' },
        { status: 400 }
      );
    }
    
    // --- 2. Verificar se o Usuário ou Empresa já existem ---
    const existingUser = await prisma.user.findFirst({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: 'Este email já está em uso.' },
        { status: 409 } // 409 Conflict
      );
    }

    const existingEmpresa = await prisma.empresa.findUnique({
      where: { cnpj },
    });

    if (existingEmpresa) {
      return NextResponse.json(
        { message: 'Este CNPJ já está cadastrado.' },
        { status: 409 }
      );
    }

    // --- 3. Criptografar a Senha ---
    const hashedPassword = await bcrypt.hash(password, 10); // 10 é o custo do salt

    // --- 4. Criar Holding, Empresa e Usuário em uma Transação ---
    // A transação garante que todas as operações sejam bem-sucedidas, ou nenhuma delas será executada.
    const result = await prisma.$transaction(async (tx) => {
      // Cria uma Holding para a nova empresa
      const newHolding = await tx.holding.create({
        data: {
          nome: `${name} Holding`, // Um nome padrão para a holding
        },
      });

      // Cria a Empresa vinculada à Holding
      const newEmpresa = await tx.empresa.create({
        data: {
          cnpj: cnpj,
          nome: `${name} LTDA`, // Um nome padrão para a empresa
          holdingId: newHolding.id,
        },
      });

      // Cria o Usuário Administrador vinculado à Empresa
      const newUser = await tx.user.create({
        data: {
          name: name,
          email: email.toLowerCase(),
          username: email.toLowerCase(), // Usando email como username inicial
          password: hashedPassword,
          empresaId: newEmpresa.id,
          role: 'ADMIN', // O primeiro usuário é o admin da empresa
        },
      });

      return newUser;
    });

    // Remove a senha do objeto de retorno por segurança
    const { password: _, ...userWithoutPassword } = result;

    // --- 5. Retornar Resposta de Sucesso ---
    return NextResponse.json(userWithoutPassword, { status: 201 }); // 201 Created

  } catch (error) {
    console.error('Erro no cadastro:', error);
    return NextResponse.json(
      { message: 'Ocorreu um erro interno no servidor.' },
      { status: 500 }
    );
  }
}