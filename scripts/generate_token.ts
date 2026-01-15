
import { signSession } from '../src/lib/auth.ts';

async function generate() {
    // Generate a token for a mock admin user
    const token = await signSession({
        userId: 'U_MOCK_ADMIN_001',
        displayName: 'Automated Tester',
        pictureUrl: 'https://example.com/avatar.png',
        role: 'admin'
    });
    console.log(token);
}

generate().catch(console.error);
