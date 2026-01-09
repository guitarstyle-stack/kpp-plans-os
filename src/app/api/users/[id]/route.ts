import { NextRequest, NextResponse } from 'next/server';
import { updateUserRole, updateUserStatus, deleteUser, updateUserProfile } from '@/lib/userDataService';
import { getSession } from '@/lib/auth';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    try {
        const { id } = await params; // Here 'id' is the line_user_id
        const body = await req.json();

        if (body.role) {
            await updateUserRole(id, body.role);
        }
        if (body.status) {
            await updateUserStatus(id, body.status);
        }

        // Handle profile updates
        const profileFields = ['first_name', 'last_name', 'position', 'department_id', 'phone', 'email'];
        const hasProfileUpdates = profileFields.some(field => body[field] !== undefined);

        if (hasProfileUpdates) {
            await updateUserProfile(id, body);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    try {
        const { id } = await params;

        if (session.userId === id) {
            return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 });
        }

        await deleteUser(id);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Failed to delete user' }, { status: 500 });
    }
}
