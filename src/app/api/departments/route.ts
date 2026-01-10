import { NextResponse, NextRequest } from 'next/server';
import { getDepartments, addDepartment, updateDepartment, deleteDepartment } from '@/lib/departmentService';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// Helper type for session - defining locally as quick fix, better to import shared type
interface UserSession {
    role: string;
    [key: string]: unknown;
}

export async function GET() {
    const session = await getSession();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const departments = await getDepartments();
        return NextResponse.json(departments);
    } catch {
        return NextResponse.json({ error: 'Failed to fetch departments' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const session = await getSession();
    if (!session || (session as unknown as UserSession).role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    try {
        const { name } = await req.json();
        const result = await addDepartment(name);
        return NextResponse.json(result);
    } catch {
        return NextResponse.json({ error: 'Failed to create department' }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    const session = await getSession();
    if (!session || (session as unknown as UserSession).role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    try {
        const { id, name } = await req.json();
        const result = await updateDepartment(id, name);
        return NextResponse.json(result);
    } catch {
        return NextResponse.json({ error: 'Failed to update department' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    const session = await getSession();
    if (!session || (session as unknown as UserSession).role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

        // Check for dependencies
        const { getAllUsers } = await import('@/lib/userDataService');
        const users = await getAllUsers();
        const hasUsers = users.some(u => u.department_id === id);

        if (hasUsers) {
            return NextResponse.json({
                error: 'ไม่สามารถลบหน่วยงานได้ เนื่องจากยังมีพนักงานสังกัดอยู่ (Cannot delete: Users still assigned)'
            }, { status: 400 });
        }

        await deleteDepartment(id);
        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ error: 'Failed to delete department' }, { status: 500 });
    }
}
