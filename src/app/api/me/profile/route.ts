import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { updateUserProfile } from '@/lib/userDataService';

interface UserSession {
    userId: string;
    displayName: string;
    pictureUrl: string;
    role: string;
}

export async function PUT(req: NextRequest) {
    const sessionData = await getSession();
    const session = sessionData as unknown as UserSession;

    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();
        // Validate fields if necessary, for now we pass body to service
        // Ensure we only allow updating specific fields to avoid overwriting sensitive data like role
        const allowedUpdates = {
            first_name: body.first_name,
            last_name: body.last_name,
            position: body.position,
            department_id: body.department_id,
            phone: body.phone,
            email: body.email,
        };

        const updatedUser = await updateUserProfile(session.userId, allowedUpdates);
        return NextResponse.json(updatedUser);
    } catch (error: any) {
        console.error('Update Profile Error:', error);
        return NextResponse.json({ error: error.message || 'Failed to update profile' }, { status: 500 });
    }
}
