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
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // Allow any authenticated user to create a department (per user request)
    // Removed admin check

    try {
        const { name, organization_type } = await req.json();
        const result = await addDepartment(name, organization_type);
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
        const { id, name, organization_type } = await req.json();

        if (!id) {
            return NextResponse.json({ error: 'Department ID required' }, { status: 400 });
        }

        // Get old department to check for name change
        const { getDepartmentById } = await import('@/lib/departmentService');
        const oldDept = await getDepartmentById(id);
        const oldName = oldDept?.name;

        const updatedDepartment = await updateDepartment(id, name, organization_type);

        // Cascade Update: If name changed, update all projects
        if (oldName && oldName !== name) {
            try {
                // Import dynamically or at top level if no circular dep
                const { updateProjectAgency } = await import('@/lib/dataService');
                // Run in background (don't await strictly if not needed, but safe to await for consistency)
                await updateProjectAgency(oldName, name);
            } catch (err) {
                console.error('Failed to cascade update project agencies:', err);
            }
        }

        return NextResponse.json(updatedDepartment);
    } catch (error) {
        console.error('Error updating department:', error);
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
