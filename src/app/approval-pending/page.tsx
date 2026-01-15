import Link from 'next/link';

export default function ApprovalPendingPage() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="text-center">
                    <h1 className="text-4xl font-extrabold text-indigo-600 mb-2 font-display">PlanOS</h1>
                    <h2 className="text-2xl font-bold text-gray-900">รอการอนุมัติสิทธิ์</h2>
                </div>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 text-center">
                    <div className="mb-6 flex justify-center">
                        <div className="h-24 w-24 bg-yellow-100 rounded-full flex items-center justify-center">
                            <svg className="h-12 w-12 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>

                    <p className="text-gray-700 text-lg mb-4">
                        บัญชีของคุณอยู่ระหว่างการตรวจสอบ
                    </p>
                    <p className="text-gray-500 text-sm mb-8">
                        กรุณารอให้ผู้ดูแลระบบ (Admin) อนุมัติสิทธิ์การใช้งานของคุณ<br />
                        เมื่อได้รับการอนุมัติแล้ว คุณจะสามารถเข้าสู่ระบบได้ทันที
                    </p>
                    <div className="bg-blue-50 border border-blue-100 rounded-md p-4 mb-6">
                        <p className="text-sm text-blue-800 mb-3">
                            หากต้องการสอบถามข้อมูล หรือแจ้งอนุมัติสิทธิ์เร่งด่วน<br />
                            กรุณาติดต่อผู้ดูแลระบบผ่าน LINE Official Account
                        </p>
                        <a
                            href="https://line.me/R/ti/p/@398sjzdd"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#06C755] hover:bg-[#05b34c] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#06C755]"
                        >
                            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M21.156 8.526c0-4.053-4.226-7.353-9.42-7.353S2.316 4.473 2.316 8.526c0 3.652 3.42 6.702 8.047 7.234l.263 1.353s-.302 1.332.613 1.056c.915-.276 3.486-2.52 4.094-3.52 3.616-.762 5.822-3.1 5.822-6.123z" />
                            </svg>
                            ติดต่อ Admin ผ่าน Line OA
                        </a>
                    </div>
                    <div className="border-t border-gray-100 pt-6">
                        <Link
                            href="/"
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            กลับสู่หน้าหลัก
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
