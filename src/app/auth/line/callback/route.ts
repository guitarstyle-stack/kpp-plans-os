import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { signSession } from '@/lib/auth';
import { registerOrUpdateUser } from '@/lib/userDataService';

const LINE_TOKEN_URL = 'https://api.line.me/oauth2/v2.1/token';
const LINE_PROFILE_URL = 'https://api.line.me/v2/profile';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    // const state = searchParams.get('state'); // State check omitted for brevity in migration

    if (!code) {
        return NextResponse.json({ error: 'No code provided' }, { status: 400 });
    }

    try {
        // 1. Get Access Token
        const tokenResponse = await axios.post(
            LINE_TOKEN_URL,
            new URLSearchParams({
                grant_type: 'authorization_code',
                code,
                redirect_uri: process.env.LINE_CALLBACK_URL || '',
                client_id: process.env.LINE_CHANNEL_ID || '',
                client_secret: process.env.LINE_CHANNEL_SECRET || '',
            }),
            { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
        );

        const { access_token } = tokenResponse.data;

        // 2. Get User Profile
        const profileResponse = await axios.get(LINE_PROFILE_URL, {
            headers: { Authorization: `Bearer ${access_token}` },
        });

        const userProfile = profileResponse.data;

        // 3. Register/Update User and Get Role
        const { role, status } = await registerOrUpdateUser({
            userId: userProfile.userId,
            displayName: userProfile.displayName,
            pictureUrl: userProfile.pictureUrl,
            email: userProfile.email, // Pass email if available
        });

        if (status === 'inactive') {
            return NextResponse.redirect(new URL('/approval-pending', req.url));
        }

        // 4. Create Session Token (JWT)
        const sessionToken = await signSession({
            userId: userProfile.userId,
            displayName: userProfile.displayName,
            pictureUrl: userProfile.pictureUrl,
            role: role,
        });

        // 5. Set Cookie and Redirect
        const response = NextResponse.redirect(new URL('/dashboard', req.url));
        response.cookies.set('token', sessionToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24, // 24 hours
            path: '/',
        });

        return response;
        return response;
    } catch (error: unknown) {
        const err = error as { response?: { data?: unknown }, message?: string };
        const errorMessage = err?.response?.data ? JSON.stringify(err.response.data) : (err.message || 'Unknown error');
        console.error('Line Login Error:', errorMessage);
        return NextResponse.json({ error: 'Login failed' }, { status: 500 });
    }
}
