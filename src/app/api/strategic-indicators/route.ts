
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getStrategicIndicators, addStrategicIndicator, updateStrategicIndicator, deleteStrategicIndicator } from '@/lib/dataService';

export async function GET(request: Request) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const goalId = searchParams.get('goalId');

    if (!goalId) return NextResponse.json({ error: 'Missing goalId' }, { status: 400 });

    try {
        const indicators = await getStrategicIndicators(goalId);
        return NextResponse.json(indicators);
    } catch (error) {
        console.error('Error fetching strategic indicators:', error);
        return NextResponse.json({ error: 'Failed to fetch indicators' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const session = await getSession();
    if (!session || session.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const body = await request.json();
        const { id, goalId, name, recommended_target, unit } = body;

        const newIndicator = await addStrategicIndicator({
            id: id || Date.now().toString(),
            goalId,
            name,
            recommended_target,
            unit
        });
        return NextResponse.json(newIndicator);
    } catch (error) {
        console.error('Error creating strategic indicator:', error);
        return NextResponse.json({ error: 'Failed to create indicator' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    const session = await getSession();
    if (!session || session.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const body = await request.json();
        const updatedIndicator = await updateStrategicIndicator(body);
        return NextResponse.json(updatedIndicator);
    } catch (error) {
        console.error('Error updating strategic indicator:', error);
        return NextResponse.json({ error: 'Failed to update indicator' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    const session = await getSession();
    if (!session || session.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

    try {
        await deleteStrategicIndicator(id);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting strategic indicator:', error);
        return NextResponse.json({ error: 'Failed to delete indicator' }, { status: 500 });
    }
}
