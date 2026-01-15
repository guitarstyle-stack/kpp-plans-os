import { NextRequest, NextResponse } from 'next/server';
import { getProjectCategories, addProjectCategory } from '@/lib/dataService';
import { getSession } from '@/lib/auth';

export async function GET() {
    try {
        const categories = await getProjectCategories();
        return NextResponse.json(categories);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { name, description, fiscal_year } = body;

        if (!name) {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 });
        }

        const newCategory = await addProjectCategory({
            id: Date.now().toString(),
            name,
            description,
            fiscal_year
        });

        return NextResponse.json(newCategory, { status: 201 });
    } catch (error) {
        console.error("Check categories POST API Error:", error);
        return NextResponse.json({ error: 'Failed to create category', details: (error as Error).message }, { status: 500 });
    }
}
