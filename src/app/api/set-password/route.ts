import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export async function POST(req: Request) {
    try {
        const { username, password } = await req.json();

        const user = await prisma.user.findUnique({ where: { username } });

        if (!user) {
            return NextResponse.json({ message: 'Usuário não encontrado.' }, { status: 404 });
        }

        if (user.password) {
            return NextResponse.json({ message: 'Este usuário já definiu uma senha.' }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await prisma.user.update({
            where: { username },
            data: { password: hashedPassword },
        });

        return NextResponse.json({ message: 'Senha definida com sucesso!' }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: 'Erro ao definir senha' }, { status: 500 });
    }
}