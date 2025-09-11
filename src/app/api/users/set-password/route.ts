// app/api/users/set-password/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export async function POST(req: Request) {
    try {
        const { username, password } = await req.json();

        // 1. Validação básica de entrada
        if (!username || !password) {
            return NextResponse.json({ message: 'Usuário e senha são obrigatórios.' }, { status: 400 });
        }
        if (password.length < 6) {
            return NextResponse.json({ message: 'A senha deve ter no mínimo 6 caracteres.' }, { status: 400 });
        }

        // 2. Procura o usuário no banco de dados
        const user = await prisma.user.findUnique({
            where: { username },
        });

        if (!user) {
            return NextResponse.json({ message: 'Usuário não encontrado.' }, { status: 404 });
        }

        // 3. Verifica se a senha já foi definida (medida de segurança)
        if (user.password) {
            return NextResponse.json({ message: 'Este usuário já possui uma senha. Use a página de login regular.' }, { status: 400 });
        }

        // 4. Criptografa a nova senha
        const hashedPassword = await bcrypt.hash(password, 10);

        // 5. Atualiza o usuário no banco com a nova senha
        await prisma.user.update({
            where: { username },
            data: { password: hashedPassword },
        });

        // 6. Retorna uma resposta de sucesso
        return NextResponse.json({ message: 'Senha definida com sucesso!' }, { status: 200 });
        
    } catch (error) {
        console.error("Erro ao definir senha:", error);
        return NextResponse.json({ message: 'Ocorreu um erro no servidor ao definir a senha.' }, { status: 500 });
    }
}