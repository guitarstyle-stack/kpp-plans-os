import { doc, connectToSheet } from './googleSheets';

const SHEET_TITLE = 'Users';

export interface User {
    id: string;
    line_user_id: string;
    display_name: string;
    picture_url: string;
    role: 'admin' | 'user';
    status: 'active' | 'inactive';
    last_login: string;
    first_name?: string;
    last_name?: string;
    position?: string;
    department_id?: string;
    phone?: string;
    email?: string;
    _rowIndex?: number;
}

export async function getUser(lineUserId: string): Promise<User | null> {
    // Optimization: Try to find in cache first via getAllUsers
    // This avoids a specific single-read API call if we already have the list
    const users = await getAllUsers();
    const user = users.find(u => u.line_user_id === lineUserId);
    return user || null;
}

export async function registerOrUpdateUser(profile: { userId: string; displayName: string; pictureUrl: string }) {
    await connectToSheet();
    const sheet = doc.sheetsByTitle[SHEET_TITLE];
    if (!sheet) throw new Error(`Sheet ${SHEET_TITLE} not found`);

    const rows = await sheet.getRows();
    const existingRow = rows.find((r) => r.get('line_user_id') === profile.userId);
    const timestamp = new Date().toISOString();

    if (existingRow) {
        existingRow.assign({
            display_name: profile.displayName,
            picture_url: profile.pictureUrl,
            last_login: timestamp,
        });
        await existingRow.save();

        usersCache = null; // Invalidate cache

        try {
            const { logAudit } = await import('./auditService');
            // Log as 'LOGIN' action since this is usually called during auth
            await logAudit(profile.userId, 'LOGIN', profile.userId, 'User logged in via Line');
        } catch (e) {
            console.error('Failed to log login audit', e);
        }

        return {
            role: existingRow.get('role'),
            status: existingRow.get('status'),
        };
    } else {
        await sheet.addRow({
            line_user_id: profile.userId,
            display_name: profile.displayName,
            picture_url: profile.pictureUrl,
            role: 'user',
            status: 'active',
            last_login: timestamp,
        });

        usersCache = null; // Invalidate cache

        try {
            const { logAudit } = await import('./auditService');
            await logAudit(profile.userId, 'CREATE', profile.userId, 'New user registered via Line');
        } catch { console.error('Error logging audit'); }

        return {
            role: 'user',
            status: 'active',
        };
    }
}

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
let usersCache: User[] | null = null;
let usersCacheTime = 0;

export async function getAllUsers(): Promise<User[]> {
    const now = Date.now();
    if (usersCache && (now - usersCacheTime < CACHE_TTL)) {
        console.log('[Cache] Returning cached users');
        return usersCache;
    }

    await connectToSheet();
    const sheet = doc.sheetsByTitle[SHEET_TITLE];
    if (!sheet) throw new Error(`Sheet ${SHEET_TITLE} not found`);

    const rows = await sheet.getRows();
    const users = rows.map((row) => ({
        id: row.get('id') || '',
        line_user_id: row.get('line_user_id'),
        display_name: row.get('display_name'),
        picture_url: row.get('picture_url'),
        role: row.get('role') as 'admin' | 'user',
        status: row.get('status') as 'active' | 'inactive',
        last_login: row.get('last_login'),
        first_name: row.get('first_name'),
        last_name: row.get('last_name'),
        position: row.get('position'),
        department_id: row.get('department_id'),
        phone: row.get('phone'),
        email: row.get('email'),
        _rowIndex: (row as unknown as { rowIndex: number }).rowIndex,
    }));

    usersCache = users;
    usersCacheTime = now;
    console.log('[Cache] Miss - Fetched users from Sheet');
    return users;
}

export async function updateUserRole(lineUserId: string, newRole: 'admin' | 'user') {
    await connectToSheet();
    const sheet = doc.sheetsByTitle[SHEET_TITLE];
    if (!sheet) throw new Error(`Sheet ${SHEET_TITLE} not found`);

    const rows = await sheet.getRows();
    const row = rows.find((r) => r.get('line_user_id') === lineUserId);
    if (!row) throw new Error('User not found');

    row.assign({ role: newRole });
    await row.save();
    usersCache = null; // Invalidate cache

    // We don't have actor ID easily here without context, defaulting to 'SYSTEM' or assume Admin
    // Ideally we should pass actorId to this function
    try {
        const { logAudit } = await import('./auditService');
        await logAudit('ADMIN', 'UPDATE', lineUserId, `Role changed to ${newRole}`);
    } catch { console.error('Audit log failed'); }
}

export async function updateUserStatus(lineUserId: string, newStatus: 'active' | 'inactive') {
    await connectToSheet();
    const sheet = doc.sheetsByTitle[SHEET_TITLE];
    if (!sheet) throw new Error(`Sheet ${SHEET_TITLE} not found`);

    const rows = await sheet.getRows();
    const row = rows.find((r) => r.get('line_user_id') === lineUserId);
    if (!row) throw new Error('User not found');

    row.assign({ status: newStatus });
    await row.save();
    usersCache = null; // Invalidate cache

    try {
        const { logAudit } = await import('./auditService');
        await logAudit('ADMIN', 'UPDATE', lineUserId, `Status changed to ${newStatus}`);
    } catch { console.error('Audit log failed'); }
}

export async function updateUserProfile(lineUserId: string, profile: Partial<User>) {
    await connectToSheet();
    const sheet = doc.sheetsByTitle[SHEET_TITLE];
    if (!sheet) throw new Error(`Sheet ${SHEET_TITLE} not found`);

    const rows = await sheet.getRows();
    const row = rows.find((r) => r.get('line_user_id') === lineUserId);
    if (!row) throw new Error('User not found');

    const updates: Record<string, unknown> = {};
    if (profile.first_name !== undefined) updates.first_name = profile.first_name;
    if (profile.last_name !== undefined) updates.last_name = profile.last_name;
    if (profile.position !== undefined) updates.position = profile.position;
    if (profile.department_id !== undefined) updates.department_id = profile.department_id;
    if (profile.phone !== undefined) updates.phone = `'${profile.phone}`;
    if (profile.email !== undefined) updates.email = profile.email;

    // Also allow updating basic info if needed
    if (profile.display_name !== undefined) updates.display_name = profile.display_name;
    if (profile.picture_url !== undefined) updates.picture_url = profile.picture_url;

    row.assign(updates);
    await row.save();

    usersCache = null; // Invalidate cache

    return {
        id: row.get('id') || '',
        line_user_id: row.get('line_user_id'),
        display_name: row.get('display_name'),
        picture_url: row.get('picture_url'),
        role: row.get('role') as 'admin' | 'user',
        status: row.get('status') as 'active' | 'inactive',
        last_login: row.get('last_login'),
        first_name: row.get('first_name'),
        last_name: row.get('last_name'),
        position: row.get('position'),
        department_id: row.get('department_id'),
        phone: row.get('phone'),
        email: row.get('email'),
        _rowIndex: (row as unknown as { rowIndex: number }).rowIndex,
    };

}

export async function deleteUser(lineUserId: string) {
    await connectToSheet();
    const sheet = doc.sheetsByTitle[SHEET_TITLE];
    if (!sheet) throw new Error(`Sheet ${SHEET_TITLE} not found`);

    const rows = await sheet.getRows();
    const row = rows.find((r) => r.get('line_user_id') === lineUserId);

    if (row) {
        await row.delete();
        usersCache = null; // Invalidate cache

        try {
            const { logAudit } = await import('./auditService');
            await logAudit('ADMIN', 'DELETE', lineUserId, 'User deleted');
        } catch { console.error('Audit log failed'); }
    } else {
        throw new Error('User not found');
    }
}
