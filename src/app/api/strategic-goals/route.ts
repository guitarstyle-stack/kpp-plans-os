
import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { getSession } from '@/lib/auth';
import { getStrategicGoals, addStrategicGoal, updateStrategicGoal, deleteStrategicGoal } from '@/lib/dataService';

export async function GET(request: Request) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const planId = searchParams.get('planId');

    if (!planId) return NextResponse.json({ error: 'Missing planId' }, { status: 400 });

    try {
        const goals = await getStrategicGoals(planId);
        return NextResponse.json(goals);
    } catch (error) {
        console.error('Error fetching strategic goals:', error);
        return NextResponse.json({ error: 'Failed to fetch goals' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const session = await getSession();
    if (!session || session.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const body = await request.json();
        const { id, planId, name } = body;

        const newGoal = await addStrategicGoal({
            id: id || Date.now().toString(),
            planId,
            name
        });
        return NextResponse.json(newGoal);
    } catch (error) {
        console.error('Error creating strategic goal:', error);
        return NextResponse.json({ error: 'Failed to create goal' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    const session = await getSession();
    if (!session || session.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const body = await request.json();
        const updatedGoal = await updateStrategicGoal(body);
        return NextResponse.json(updatedGoal);
    } catch (error) {
        console.error('Error updating strategic goal:', error);
        return NextResponse.json({ error: 'Failed to update goal' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    const session = await getSession();
    if (!session || session.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

    try {
        await deleteStrategicGoal(id);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting strategic goal:', error);
        return NextResponse.json({ error: 'Failed to delete goal' }, { status: 500 });
    }
}
