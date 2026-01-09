import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { getUser } from '@/lib/userDataService';
import ProfileClient from '@/components/ProfileClient';

interface UserSession {
    userId: string;
    displayName: string;
    pictureUrl: string;
    role: string;
}

export default async function ProfilePage() {
    const sessionData = await getSession();
    const session = sessionData as unknown as UserSession;

    if (!session) {
        redirect('/');
    }

    const user = await getUser(session.userId);

    if (!user) {
        redirect('/'); // Should not happen if session exists, but safety check
    }

    return (
        <div className="flex h-screen overflow-hidden bg-gray-50 text-gray-800 font-sans">
            {/* Sidebar - Reusing basic structure, ideally should be a component */}
            <aside className="hidden md:flex w-64 flex-col bg-white border-r border-gray-200">
                <div className="flex items-center justify-center h-16 border-b border-gray-100 p-4">
                    <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 font-display">PlanOS</span>
                </div>
                <div className="flex-1 overflow-y-auto py-4">
                    <nav className="space-y-1 px-2">
                        <a href="/dashboard" className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors">
                            <svg className="mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                            ภาพรวมโครงการ
                        </a>
                        {session.role === 'admin' && (
                            <a href="/admin/users" className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors">
                                <svg className="mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                                จัดการผู้ใช้งาน
                            </a>
                        )}
                    </nav>
                </div>
                <div className="border-t border-gray-200 p-4">
                    <div className="flex items-center">
                        {session.pictureUrl && <img className="h-9 w-9 rounded-full bg-gray-300 object-cover ring-2 ring-white shadow-md" src={session.pictureUrl} alt="" />}
                        <div className="ml-3 overflow-hidden">
                            <p className="text-sm font-medium text-gray-700 truncate">{session.displayName}</p>
                            <a href="/auth/logout" className="text-xs text-red-500 hover:text-red-700 font-medium">ออกจากระบบ</a>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto bg-gray-50/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <ProfileClient user={user} />
                </div>
            </main>
        </div>
    );
}
