import Link from 'next/link';

export default function Home() {
    return (
        <main className="bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-800 h-screen flex items-center justify-center p-4">
            {/* Glassmorphism Card */}
            <div className="max-w-md w-full bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 p-8 transform transition-all">
                <div className="text-center mb-10">
                    <div className="mx-auto h-16 w-16 bg-white/20 rounded-full flex items-center justify-center mb-4 ring-4 ring-white/10">
                        <svg
                            className="h-8 w-8 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                            />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2 tracking-wide font-display">
                        PlanOS Monitor
                    </h1>
                    <p className="text-indigo-200 text-sm">
                        ระบบติดตามผลการดำเนินงาน<br />
                        แผนปฏิบัติการพัฒนาสังคมจังหวัดกำแพงเพชร
                    </p>
                </div>

                <div className="space-y-6">
                    <a
                        href="/auth/line/login"
                        className="group relative w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-[#06C755] hover:bg-[#05b34c] focus:outline-none focus:ring-4 focus:ring-[#06C755]/50 transition-all duration-300 transform hover:-translate-y-1"
                    >
                        <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                            <svg
                                className="h-5 w-5 text-white/90 group-hover:text-white"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path d="M24 10.304c0-5.369-5.383-9.738-12-9.738-6.616 0-12 4.369-12 9.738 0 4.814 4.269 8.846 10.036 9.608.391.084.922.258 1.057.592.121.303.079.778.039 1.085l-.171 1.027c-.053.303-.242 1.186 1.039.647 1.281-.54 6.911-4.069 9.428-6.967 1.739-1.992 2.678-4.216 2.678-6.483z" />
                            </svg>
                        </span>
                        เข้าสู่ระบบด้วย LINE
                    </a>

                    <div className="relative mt-8">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-white/10"></div>
                        </div>
                        <div className="relative flex justify-center text-xs">
                            <span className="px-2 text-indigo-200 bg-transparent">
                                Secure Access Restricted
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            <div className="absolute bottom-4 text-indigo-300/40 text-xs">
                © 2025 Kamphaeng Phet Provincial Office
            </div>
        </main>
    );
}
