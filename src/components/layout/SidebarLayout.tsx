'use client';

import { useState, ReactNode } from 'react';
import Link from 'next/link';

interface UserSession {
    userId?: string;
    displayName?: string; // camelCase
    display_name?: string; // snake_case from DB/Auth
    firstName?: string;
    lastName?: string;
    first_name?: string; // snake_case from DB
    last_name?: string; // snake_case from DB
    pictureUrl?: string; // camelCase
    picture_url?: string; // snake_case from DB/Auth
    role: string;
}

interface SidebarLayoutProps {
    children: ReactNode;
    user: UserSession;
    extraSidebarContent?: ReactNode;
    topSidebarContent?: ReactNode;
    activePage: 'dashboard' | 'users' | 'departments' | 'profile' | 'report' | 'audit-logs' | 'projects' | 'admin-projects' | 'categories' | 'strategic-plans';
}

export default function SidebarLayout({ children, user, extraSidebarContent, topSidebarContent, activePage }: SidebarLayoutProps) {
    const [isCollapsed, setIsCollapsed] = useState(false);

    const toggleSidebar = () => setIsCollapsed(!isCollapsed);

    // Determine display name
    const firstName = user.firstName || user.first_name;
    const lastName = user.lastName || user.last_name;
    const displayName = firstName && lastName
        ? `${firstName} ${lastName}`
        : (user.displayName || user.display_name);

    const navItems = [
        {
            id: 'dashboard',
            label: 'ภาพรวมโครงการ',
            href: '/dashboard',
            icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
            )
        },
        {
            id: 'projects',
            label: 'โครงการของฉัน',
            href: '/dashboard/projects',
            icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
            )
        },
        {
            id: 'report',
            label: 'รายงานผล',
            href: '/dashboard/reports',
            icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            )
        },
        ...(user.role === 'admin' ? [
            {
                id: 'users',
                label: 'จัดการผู้ใช้งาน',
                href: '/admin/users',
                icon: (
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                )
            },
            {
                id: 'departments',
                label: 'จัดการหน่วยงาน',
                href: '/admin/departments',
                icon: (
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                )
            },
            {
                id: 'strategic-plans',
                label: 'แผนพัฒนารายประเด็น (Master Data)',
                href: '/admin/strategic-plans',
                icon: (
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                )
            },
            {
                id: 'categories',
                label: 'รายละเอียดแผน',
                href: '/admin/categories',
                icon: (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                )
            },
            {
                id: 'admin-projects',
                label: 'จัดการโครงการ',
                href: '/dashboard/admin/projects',
                icon: (
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                )
            },
            {
                id: 'audit-logs',
                label: 'Audit Logs',
                href: '/dashboard/admin/audit-logs',
                icon: (
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                )
            }
        ] : [])
    ];

    return (
        <div className="flex h-screen overflow-hidden bg-gray-50 text-gray-800 font-sans">
            {/* Sidebar */}
            <aside
                className={`hidden md:flex flex-col bg-white border-r border-gray-200 transition-all duration-300 ease-in-out ${isCollapsed ? 'w-20' : 'w-64'}`}
            >
                {/* Header / Logo */}
                <div className="flex items-center justify-between h-16 border-b border-gray-100 px-4">
                    {!isCollapsed && (
                        <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 font-display whitespace-nowrap overflow-hidden">
                            PlanOS
                        </span>
                    )}
                    <button
                        onClick={toggleSidebar}
                        className={`p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors ${isCollapsed ? 'mx-auto' : ''}`}
                        title={isCollapsed ? "ขยายเมนู" : "ย่อเมนู"}
                    >
                        {isCollapsed ? (
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                            </svg>
                        ) : (
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                            </svg>
                        )}
                    </button>
                </div>

                {/* Navigation */}
                <div className="flex-1 overflow-y-auto py-4 flex flex-col justify-between">
                    <div>
                        {/* Top Sidebar Content (Prominent Filters) */}
                        {!isCollapsed && topSidebarContent && (
                            <div className="px-4 mb-6">
                                {topSidebarContent}
                            </div>
                        )}

                        <nav className="space-y-6 px-2">
                            {/* Main Section */}
                            <div>
                                {!isCollapsed && (
                                    <h3 className="px-4 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                        หน้าหลัก
                                    </h3>
                                )}
                                <div className="space-y-1">
                                    {navItems.filter(item => item.id === 'dashboard' || item.id === 'projects' || item.id === 'report').map((item) => (
                                        <Link
                                            key={item.id}
                                            href={item.href}
                                            className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all ${activePage === item.id
                                                ? 'bg-indigo-50 text-indigo-600 shadow-sm'
                                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                                } ${isCollapsed ? 'justify-center' : ''}`}
                                            title={isCollapsed ? item.label : ''}
                                        >
                                            <span className={`${activePage === item.id ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-500'} ${isCollapsed ? '' : 'mr-3'}`}>
                                                {item.icon}
                                            </span>
                                            {!isCollapsed && <span>{item.label}</span>}
                                        </Link>
                                    ))}
                                </div>
                            </div>

                            {/* Admin Section */}
                            {user.role === 'admin' && (
                                <div>
                                    {!isCollapsed && (
                                        <h3 className="px-4 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                            ผู้ดูแลระบบ
                                        </h3>
                                    )}
                                    <div className="space-y-1">
                                        {navItems.filter(item => {
                                            // Always show regular admin items (admin-projects removed from here)
                                            if (['users', 'departments', 'strategic-plans', 'audit-logs'].includes(item.id)) return true;
                                            // Only show Submenus (categories, admin-projects) if parent or self is active
                                            if (['categories', 'admin-projects'].includes(item.id)) {
                                                return ['strategic-plans', 'categories', 'admin-projects'].includes(activePage);
                                            }
                                            return false;
                                        }).map((item) => (
                                            <Link
                                                key={item.id}
                                                href={item.href}
                                                className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all 
                                                    ${['categories', 'admin-projects'].includes(item.id) && !isCollapsed ? 'ml-6 border-l-2 border-indigo-100 pl-3 rounded-none' : ''}
                                                    ${activePage === item.id
                                                        ? 'bg-indigo-50 text-indigo-600 shadow-sm'
                                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                                    } ${isCollapsed ? 'justify-center' : ''}`}
                                                title={isCollapsed ? item.label : ''}
                                            >
                                                <span className={`${activePage === item.id ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-500'} ${isCollapsed ? '' : 'mr-3'}`}>
                                                    {item.icon}
                                                </span>
                                                {!isCollapsed && <span>{item.label}</span>}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </nav>

                        {/* Extra Content (Filters etc) - Only show when expanded */}
                        {!isCollapsed && extraSidebarContent && (
                            <div className="px-4 py-4 mt-4 border-t border-gray-100">
                                {extraSidebarContent}
                            </div>
                        )}
                    </div>

                    {/* User Profile Footer */}
                    <div className="border-t border-gray-200 p-4">
                        <div className={`flex items-center ${isCollapsed ? 'justify-center' : ''}`}>
                            {(user.pictureUrl || user.picture_url) ? (
                                /* eslint-disable-next-line @next/next/no-img-element */
                                <img className="h-9 w-9 rounded-full bg-gray-300 object-cover ring-2 ring-white shadow-md" src={user.pictureUrl || user.picture_url} alt="" />
                            ) : (
                                <div className="h-9 w-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold border-2 border-white shadow-md">
                                    {(displayName || 'U').charAt(0)}
                                </div>
                            )}

                            {!isCollapsed && (
                                <div className="ml-3 overflow-hidden">
                                    <Link href="/profile" className="text-sm font-medium text-gray-700 truncate hover:text-indigo-600 transition-colors block">
                                        {displayName}
                                    </Link>
                                    <a href="/auth/logout" className="text-xs text-red-500 hover:text-red-700 font-medium flex items-center mt-0.5">
                                        <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                        </svg>
                                        ออกจากระบบ
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto bg-gray-50/50">
                {children}
            </main>
        </div>
    );
}
