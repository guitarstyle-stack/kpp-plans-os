
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const projectCount = await prisma.project.count();
        const userCount = await prisma.user.count();
        return NextResponse.json({
            status: 'ok',
            projectCount,
            userCount,
            env: {
                has_prisma_url: !!process.env.POSTGRES_PRISMA_URL,
                has_non_pooling: !!process.env.POSTGRES_URL_NON_POOLING
            }
        });
    } catch (error: any) {
        return NextResponse.json({
            status: 'error',
            message: error.message,
            stack: error.stack
        }, { status: 500 });
    }
}
