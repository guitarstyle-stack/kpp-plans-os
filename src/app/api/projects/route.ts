import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { createProject, updateProject, deleteProject } from '@/lib/projectService';
import { getProjects } from '@/lib/dataService';
import { getUser } from '@/lib/userDataService';
import { getDepartmentById } from '@/lib/departmentService';

export const dynamic = 'force-dynamic';

// GET - Fetch projects (filtered by department for non-admins)
export async function GET() {
    const session = await getSession();

    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const projects = await getProjects();

        // Admin sees all projects
        if (session.role === 'admin') {
            return NextResponse.json(projects);
        }

        // Non-admin users see only their department's projects
        const user = await getUser(session.userId as string);
        if (!user || !user.department_id) {
            return NextResponse.json([]);
        }

        const department = await getDepartmentById(user.department_id);
        if (!department) {
            return NextResponse.json([]);
        }

        const filteredProjects = projects.filter(p => p.agency === department.name);
        return NextResponse.json(filteredProjects);
    } catch (error) {
        console.error('Error fetching projects:', error);
        return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
    }
}

// POST - Create new project (Admin only)
export async function POST(request: NextRequest) {
    const session = await getSession();

    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 });
    }

    try {
        const projectData = await request.json();
        const newProject = await createProject(projectData);
        return NextResponse.json(newProject, { status: 201 });
    } catch (error) {
        console.error('Error creating project:', error);
        return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
    }
}

// PUT - Update project (Admin only)
export async function PUT(request: NextRequest) {
    const session = await getSession();

    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 });
    }

    try {
        const { id, ...projectData } = await request.json();
        if (!id) {
            return NextResponse.json({ error: 'Project ID required' }, { status: 400 });
        }

        const updatedProject = await updateProject(id, projectData);
        return NextResponse.json(updatedProject);
    } catch (error) {
        console.error('Error updating project:', error);
        return NextResponse.json({ error: 'Failed to update project' }, { status: 500 });
    }
}

// DELETE - Delete project (Admin only)
export async function DELETE(request: NextRequest) {
    const session = await getSession();

    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 });
    }

    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Project ID required' }, { status: 400 });
        }

        await deleteProject(id);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting project:', error);
        return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 });
    }
}
