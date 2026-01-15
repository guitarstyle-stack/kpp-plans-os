import { prisma } from '@/lib/prisma';

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
function mapDbUserToAppUser(dbUser: any): User {
    return {
        id: dbUser.id,
        line_user_id: dbUser.username, // Assuming username is used for line_user_id
        display_name: dbUser.username, // Or add a display_name field to schema if needed
        picture_url: '', // Schema doesn't currently support picture_url
        role: dbUser.role as 'admin' | 'user',
        status: 'active', // Default to active as status isn't in DB schema yet
        last_login: new Date().toISOString(), // DB createdAt/updatedAt
        first_name: '', // Not in schema
        last_name: '', // Not in schema
        position: '', // Not in schema
        department_id: dbUser.departmentId || undefined,
        phone: '', // Not in schema
        email: '', // Not in schema
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

export async function registerOrUpdateUser(profile: { userId: string; displayName: string; pictureUrl: string }) {
    const existingUser = await prisma.user.findUnique({
        where: { username: profile.userId }
    });

    if (existingUser) {
        // Update logic if fields existed in DB
        // currently only username/role/dept are in DB.

        try {
            const { logAudit } = await import('./auditService');
            await logAudit(profile.userId, 'LOGIN', profile.userId, 'User logged in via Line');
        } catch (e) {
            console.error('Failed to log login audit', e);
        }

        return {
            role: existingUser.role,
            status: 'active' // existingUser.status if added to schema
        };
    } else {
        // Create new user
        // Default password for LINE users - in production consider a better strategy or generic one
        await prisma.user.create({
            data: {
                username: profile.userId,
                password: 'LINE_LOGIN_USER',
                role: 'user',
            }
        });

        try {
            const { logAudit } = await import('./auditService');
            await logAudit(profile.userId, 'CREATE', profile.userId, 'New user registered via Line');
        } catch { console.error('Error logging audit'); }

        return {
            role: 'user',
            status: 'active' // Pending logic?
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

