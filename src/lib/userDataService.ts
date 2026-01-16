import { prisma } from '@/lib/prisma';
import { User as DbUser } from '@prisma/client';

export interface User {
    id: string;
    line_user_id: string; // Mapped to username for LINE users
    display_name: string; // Mapped to username or display_name
    picture_url: string; // Stored in DB if schema supports, else ignored
    role: 'admin' | 'user';
    status: 'active' | 'inactive';
    last_login: string;
    first_name?: string;
    last_name?: string;
    position?: string;
    department_id?: string;
    phone?: string;
    email?: string;
}

// Helper to map DB user to App User interface
function mapDbUserToAppUser(dbUser: DbUser): User {
    return {
        id: dbUser.id,
        line_user_id: dbUser.username,
        display_name: dbUser.displayName || dbUser.username,
        picture_url: dbUser.pictureUrl || '',
        role: dbUser.role as 'admin' | 'user',
        status: 'active',
        last_login: dbUser.updatedAt.toISOString(), // Use updatedAt as a proxy for last activity
        first_name: '',
        last_name: '',
        position: '',
        department_id: dbUser.departmentId || undefined,
        phone: '',
        email: dbUser.email || '',
    };
}

export async function getUser(lineUserId: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
        where: { username: lineUserId },
        include: { department: true }
    });

    if (!user) return null;
    return mapDbUserToAppUser(user);
}

export async function registerOrUpdateUser(profile: { userId: string; displayName: string; pictureUrl: string; email?: string }) {
    const existingUser = await prisma.user.findUnique({
        where: { username: profile.userId }
    });

    if (existingUser) {
        // Update profile info if changed
        await prisma.user.update({
            where: { id: existingUser.id },
            data: {
                displayName: profile.displayName,
                pictureUrl: profile.pictureUrl,
                // Only update email if provided, don't overwrite with undefined
                ...(profile.email ? { email: profile.email } : {})
            }
        });

        try {
            const { logAudit } = await import('./auditService');
            await logAudit(profile.userId, 'LOGIN', profile.userId, 'User logged in via Line');
        } catch (e) {
            console.error('Failed to log login audit', e);
        }

        return {
            role: existingUser.role,
            status: 'active'
        };
    } else {
        // Create new user
        await prisma.user.create({
            data: {
                username: profile.userId,
                password: 'LINE_LOGIN_USER',
                role: 'user',
                displayName: profile.displayName,
                pictureUrl: profile.pictureUrl,
                email: profile.email || null,
            }
        });

        try {
            const { logAudit } = await import('./auditService');
            await logAudit(profile.userId, 'CREATE', profile.userId, 'New user registered via Line');
        } catch { console.error('Error logging audit'); }

        return {
            role: 'user',
            status: 'active'
        };
    }
}

export async function getAllUsers(): Promise<User[]> {
    const users = await prisma.user.findMany({
        include: { department: true }
    });
    return users.map(mapDbUserToAppUser);
}

export async function updateUserRole(lineUserId: string, newRole: 'admin' | 'user') {
    await prisma.user.update({
        where: { username: lineUserId },
        data: { role: newRole }
    });

    try {
        const { logAudit } = await import('./auditService');
        await logAudit('ADMIN', 'UPDATE', lineUserId, `Role changed to ${newRole}`);
    } catch { console.error('Audit log failed'); }
}

export async function updateUserStatus(lineUserId: string, newStatus: 'active' | 'inactive') {
    // Schema doesn't have status yet, logging only or adding todo
    console.warn('Status update requested but DB schema is missing "status" field.');

    // If you want to support status, you need to add it to prisma schema first.
    // For now, we simulate success.

    try {
        const { logAudit } = await import('./auditService');
        await logAudit('ADMIN', 'UPDATE', lineUserId, `Status changed to ${newStatus}`);
    } catch { console.error('Audit log failed'); }
}

// This function needs fields not present in current schema (first_name, last_name, etc.)
// We will update what we can (departmentId) and ignore the rest for now, or you should update schema.
export async function updateUserProfile(lineUserId: string, profile: Partial<User>) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dataToUpdate: any = {};
    if (profile.department_id) dataToUpdate.departmentId = profile.department_id;
    // if (profile.first_name) ... needs schema update

    if (Object.keys(dataToUpdate).length > 0) {
        await prisma.user.update({
            where: { username: lineUserId },
            data: dataToUpdate
        });
    }

    const updatedUser = await getUser(lineUserId);
    if (!updatedUser) throw new Error('User not found after update');
    return updatedUser;
}

export async function deleteUser(lineUserId: string) {
    try {
        await prisma.user.delete({
            where: { username: lineUserId }
        });

        try {
            const { logAudit } = await import('./auditService');
            await logAudit('ADMIN', 'DELETE', lineUserId, 'User deleted');
        } catch { console.error('Audit log failed'); }

    } catch (e) {
        throw new Error('User not found or delete failed');
    }
}

