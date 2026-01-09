import { NextResponse } from 'next/server';

const LINE_AUTH_URL = 'https://access.line.me/oauth2/v2.1/authorize';

export async function GET() {
    const state = Math.random().toString(36).substring(7);
    const params = new URLSearchParams({
        response_type: 'code',
        client_id: process.env.LINE_CHANNEL_ID || '',
        redirect_uri: process.env.LINE_CALLBACK_URL || '',
        state: state,
        scope: 'profile openid',
    });

    return NextResponse.redirect(`${LINE_AUTH_URL}?${params.toString()}`);
}
