
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getStrategicPlans, addStrategicPlan, updateStrategicPlan, deleteStrategicPlan } from '@/lib/dataService';

export async function GET(request: Request) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const fiscalYear = searchParams.get('fiscalYear') || undefined;

    try {
        const plans = await getStrategicPlans(fiscalYear);
        return NextResponse.json(plans);
    } catch (error) {
        console.error('Error fetching strategic plans:', error);
        return NextResponse.json({ error: 'Failed to fetch plans' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const session = await getSession();
    if (!session || session.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const body = await request.json();
        const { id, name, fiscal_year } = body;

        // If ID matches an existing one (conceptually), or if put logic is desired, handle separately. 
        // But here POST is creating new.
        const newPlan = await addStrategicPlan({
            id: id || Date.now().toString(),
            name,
            fiscal_year
        });
        return NextResponse.json(newPlan);
    } catch (error) {
        console.error('Error creating strategic plan:', error);
        return NextResponse.json({ error: 'Failed to create plan' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    const session = await getSession();
    if (!session || session.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const body = await request.json();
        const updatedPlan = await updateStrategicPlan(body);
        return NextResponse.json(updatedPlan);
    } catch (error) {
        console.error('Error updating strategic plan:', error);
        return NextResponse.json({ error: 'Failed to update plan' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    const session = await getSession();
    if (!session || session.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

    try {
        await deleteStrategicPlan(id);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting strategic plan:', error);
        return NextResponse.json({ error: 'Failed to delete plan' }, { status: 500 });
    }
}
