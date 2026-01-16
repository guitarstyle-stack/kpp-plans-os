import { prisma } from './prisma';
import { Department as PrismaDepartment } from '@prisma/client';

export interface Department {
    id: string;
    name: string;
    code?: string; // Align with schema
    organization_type?: 'government' | 'private' | 'local_government' | 'civil_society' | 'other';
}

// Simple in-memory cache removed for real-time requirement


export async function getDepartments(): Promise<Department[]> {
    // Cache check removed


    try {
        const departments = await prisma.department.findMany({
            orderBy: { name: 'asc' }
        });

        // Map Prisma model to Service type if needed, or just cast
        // Since schema doesn't have org_type yet, we might lose that data or need to add it to schema.
        // For now, will return basic data.
        const mapped = departments.map(d => ({
            id: d.id,
            name: d.name,
            code: d.code || undefined,
            organization_type: undefined // Schema doesn't have this yet, plan to add later if critical
        }));


        return mapped;
    } catch (error) {
        console.error('Failed to fetch departments:', error);
        return [];
    }
}

export async function getDepartmentById(id: string): Promise<Department | null> {
    try {
        const dept = await prisma.department.findUnique({ where: { id } });
        if (!dept) return null;
        return {
            id: dept.id,
            name: dept.name,
            code: dept.code || undefined,
            organization_type: undefined
        };
    } catch (error) {
        console.error('Failed to fetch department:', error);
        return null;
    }
}

export async function addDepartment(name: string, organization_type?: string) {
    try {
        const newDept = await prisma.department.create({
            data: {
                name,
                // schema doesn't have type yet, so we ignore organization_type for now or store it if we update schema
            }
        });



        const { logAudit } = await import('./auditService');
        await logAudit('ADMIN', 'CREATE', newDept.id, `Department created: ${name}`);

        return { id: newDept.id, name: newDept.name };
    } catch (error) {
        console.error('Failed to create department:', error);
        throw error;
    }
}

export async function updateDepartment(id: string, name: string, organization_type?: string) {
    try {
        const updated = await prisma.department.update({
            where: { id },
            data: { name }
        });



        const { logAudit } = await import('./auditService');
        await logAudit('ADMIN', 'UPDATE', id, `Department updated name to: ${name}`);

        return { id: updated.id, name: updated.name };
    } catch (error) {
        console.error('Failed to update department:', error);
        throw error;
    }
}

export async function deleteDepartment(id: string) {
    try {
        await prisma.department.delete({ where: { id } });


        const { logAudit } = await import('./auditService');
        await logAudit('ADMIN', 'DELETE', id, 'Department deleted');
    } catch (error) {
        console.error('Failed to delete department:', error);
        throw error;
    }
}
