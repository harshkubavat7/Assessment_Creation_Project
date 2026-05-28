'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAssignmentStore } from '../store/useAssignmentStore';
import { getMe, logoutTeacher } from '../lib/api';
import './globals.css';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname() || '';
  const router = useRouter();

  const { user, setUser, authStatus, setAuthStatus, resetJob } = useAssignmentStore();

  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const isAuthPage = pathname === '/login' || pathname === '/signup';

  // 1. Session verification check on mount
  useEffect(() => {
    async function checkSession() {
      if (authStatus === 'idle') {
        setAuthStatus('checking');
        try {
          const profile = await getMe();
          setUser(profile);
          setAuthStatus('authenticated');
        } catch (err) {
          setUser(null);
          setAuthStatus('unauthenticated');
        }
      }
    }
    checkSession();
  }, [authStatus, setAuthStatus, setUser]);

  // 2. Redirect to login if unauthenticated
  useEffect(() => {
    if (authStatus === 'unauthenticated' && !isAuthPage) {
      router.push('/login');
    }
  }, [authStatus, isAuthPage, router]);

  // 3. Redirect authenticated users away from auth pages
  useEffect(() => {
    if (authStatus === 'authenticated' && isAuthPage) {
      router.push('/dashboard');
    }
  }, [authStatus, isAuthPage, router]);

  // 4. Close profile dropdown when clicking outside
  useEffect(() => {
    const handleOutsideClick = () => setShowProfileDropdown(false);
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  const handleLogout = async () => {
    try {
      await logoutTeacher();
    } catch (err) {
      console.error('Logout request failed:', err);
    }
    setUser(null);
    setAuthStatus('unauthenticated');
    resetJob();
    router.push('/login');
  };

  // Determine dynamic profile information
  const emailPrefix = user?.email ? user.email.split('@')[0] : 'Teacher';
  const displayName = emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1);
  const userInitials = displayName.substring(0, 2).toUpperCase();
  const schoolNameDisplay = user?.schoolName || 'Academic Institution';
  const schoolLocationDisplay = user?.schoolLocation || 'Education Campus';

  const menuItems = [
    {
      label: 'Home',
      path: '/dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      ),
    },
    {
      label: 'My Groups',
      path: '/groups',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
    },
    {
      label: 'Assignments',
      path: '/',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      label: "AI Teacher's Toolkit",
      path: '/toolkit',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      ),
    },
    {
      label: 'My Library',
      path: '/library',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
    },
  ];

  // Render Full Screen Auth views
  if (isAuthPage) {
    return (
      <html lang="en">
        <body className="bg-[#F4F4F6] text-[#2C2C2C] font-sans antialiased">
          {children}
        </body>
      </html>
    );
  }

  // Render Full Screen Loading Spinner during session checks
  if (authStatus === 'checking') {
    return (
      <html lang="en">
        <body className="flex h-dvh w-screen items-center justify-center bg-[#F4F4F6]">
          <div className="flex flex-col items-center">
            <span className="w-10 h-10 border-4 border-[#FF5A36] border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Checking session...</p>
          </div>
        </body>
      </html>
    );
  }

  // Render standard Authenticated Layout wrapping
  return (
    <html lang="en">
      <body className="flex h-dvh bg-[#F4F4F6] text-[#2C2C2C] font-sans overflow-hidden antialiased">
        
        {/* Desktop Left Sidebar (Hidden on mobile) */}
        <aside className="hidden md:flex w-64 bg-white border-r border-[#E5E5EA] flex-col justify-between p-6 flex-shrink-0 z-20">
          <div>
            {/* Logo */}
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#FF5A36] to-[#FF8C68] flex items-center justify-center text-white font-extrabold text-2xl shadow-sm">
                V
              </div>
              <span className="text-xl font-bold tracking-tight text-gray-900">
                Veda<span className="text-[#FF5A36]">AI</span>
              </span>
            </div>

            {/* Create Assignment Button */}
            <Link 
              href="/create" 
              className="w-full py-3 mb-8 bg-[#1C1C1E] hover:bg-black text-white rounded-full border border-[#FF5A36] font-semibold text-sm shadow-sm flex items-center justify-center space-x-2 transition"
            >
              <svg className="w-4 h-4 text-[#FF5A36]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
              </svg>
              <span>Create Assignment</span>
            </Link>

            {/* Menu Links */}
            <nav className="space-y-1">
              {menuItems.map((item) => {
                const isActive = item.path === '/'
                  ? (pathname === '/' || pathname.startsWith('/paper') || pathname.startsWith('/generating') || pathname.startsWith('/create'))
                  : pathname === item.path;
                return (
                  <Link
                    key={item.label}
                    href={item.path}
                    className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
                      isActive 
                        ? 'bg-[#F4F4F6] text-gray-900' 
                        : 'text-[#8E8E93] hover:bg-[#F9F9FB] hover:text-gray-900'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className={`transition ${isActive ? 'text-[#FF5A36]' : 'text-[#8E8E93]'}`}>{item.icon}</span>
                      <span>{item.label}</span>
                    </div>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Footer Items */}
          <div className="space-y-4">
            {/* Logout Action */}
            <button 
              onClick={handleLogout}
              className="flex items-center space-x-3 px-4 py-2 text-sm font-semibold text-red-500 hover:text-red-700 transition w-full text-left"
            >
              <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Log Out</span>
            </button>

            {/* Dynamic School Profile Card */}
            <div className="bg-[#F4F4F6] p-3.5 rounded-2xl border border-[#E5E5EA] flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center overflow-hidden border border-[#E5E5EA] shrink-0">
                <svg className="w-8 h-8 text-orange-500 mt-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-gray-900 truncate">{schoolNameDisplay}</p>
                <p className="text-[10px] text-[#8E8E93] font-semibold truncate">{schoolLocationDisplay}</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Right Pane */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          
          {/* Top Bar Header (Hidden on print) */}
          <header className="no-print print:hidden bg-[#F4F4F6] px-4 md:px-8 h-16 flex items-center justify-between flex-shrink-0 z-10">
            {/* Left Header - Search Bar */}
            <div className="flex items-center space-x-4 flex-1 max-w-xl">
              <button 
                onClick={() => window.history.back()}
                className="w-8 h-8 bg-white rounded-full border border-[#E5E5EA] text-[#8E8E93] hover:text-gray-900 transition flex items-center justify-center shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <div className="relative w-full">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8E8E93]">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </span>
                <input 
                  type="text" 
                  placeholder="Search Assignment" 
                  className="w-full bg-white border border-[#E5E5EA] rounded-full py-2 pl-10 pr-4 text-sm text-gray-800 placeholder-[#8E8E93] focus:outline-none focus:ring-2 focus:ring-[#FF5A36]/10 focus:border-[#FF5A36] transition shadow-sm"
                />
              </div>
            </div>

            {/* Right Header - User Profile details */}
            <div className="flex items-center space-x-4 ml-4">
              <button className="w-9 h-9 bg-white rounded-full border border-[#E5E5EA] text-[#8E8E93] hover:text-gray-900 relative transition flex items-center justify-center shadow-sm">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-[#FF5A36] border-2 border-white animate-pulse" />
              </button>
              
              <div className="relative">
                <div 
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowProfileDropdown(!showProfileDropdown);
                  }}
                  className="flex items-center space-x-2 bg-white border border-[#E5E5EA] py-1.5 px-3.5 rounded-full shadow-sm hover:border-[#FF5A36] cursor-pointer transition group"
                  title="Click to view profile info"
                >
                  <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center text-xs font-bold text-orange-600 border border-orange-200">
                    {userInitials}
                  </div>
                  <span className="text-xs font-bold text-gray-700 hidden sm:inline group-hover:text-[#FF5A36] transition">{displayName}</span>
                  <span className="text-[10px] text-[#8E8E93] group-hover:text-[#FF5A36]">▼</span>
                </div>

                {/* Floating Profile Dropdown Card */}
                {showProfileDropdown && (
                  <div 
                    onClick={(e) => e.stopPropagation()} 
                    className="absolute right-0 mt-2 w-64 bg-white border border-[#E5E5EA] rounded-2xl shadow-xl z-50 p-4 space-y-3.5"
                  >
                    <div>
                      <div className="text-[9px] font-bold text-[#8E8E93] uppercase tracking-wider mb-1">Teacher Account</div>
                      <div className="text-xs font-bold text-gray-900">{displayName}</div>
                      <div className="text-[10px] text-[#8E8E93] font-semibold truncate mt-0.5">{user?.email}</div>
                    </div>

                    <div className="border-t border-[#F4F4F6] pt-3">
                      <div className="text-[9px] font-bold text-[#8E8E93] uppercase tracking-wider mb-1">Affiliation</div>
                      <div className="text-xs font-bold text-gray-900">{schoolNameDisplay}</div>
                      <div className="text-[10px] text-[#8E8E93] font-semibold mt-0.5">{schoolLocationDisplay}</div>
                    </div>

                    <button 
                      onClick={handleLogout}
                      className="w-full mt-2 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl border border-red-200 text-xs font-bold transition flex items-center justify-center space-x-1.5"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <span>Log Out</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Page content view */}
          <main className="flex-1 overflow-y-auto p-4 md:p-8 pt-2 pb-24 md:pb-8">
            {children}
          </main>

          {/* Mobile Bottom Tab Bar (Hidden on Desktop & print) */}
          <div className="md:hidden no-print print:hidden absolute bottom-0 left-0 right-0 h-16 bg-[#1C1C1E] border-t border-[#2C2C2E] flex items-center justify-around px-4 z-30">
            <Link 
              href="/dashboard" 
              className={`flex flex-col items-center transition ${pathname === '/dashboard' ? 'text-[#FF5A36]' : 'text-[#8E8E93] hover:text-white'}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="text-[9px] font-bold mt-0.5">Home</span>
            </Link>
            
            <Link 
              href="/" 
              className={`flex flex-col items-center transition ${pathname === '/' || pathname.startsWith('/paper') || pathname.startsWith('/generating') || pathname.startsWith('/create') ? 'text-[#FF5A36]' : 'text-[#8E8E93] hover:text-white'}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="text-[9px] font-bold mt-0.5">Assignments</span>
            </Link>
            
            {/* Mobile Floating Action Plus Button */}
            <Link 
              href="/create" 
              className="w-12 h-12 bg-[#FF5A36] text-white rounded-full flex items-center justify-center text-2xl shadow-lg border-2 border-white -translate-y-4 hover:bg-orange-600 transition"
            >
              +
            </Link>

            <Link 
              href="/library" 
              className={`flex flex-col items-center transition ${pathname === '/library' ? 'text-[#FF5A36]' : 'text-[#8E8E93] hover:text-white'}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <span className="text-[9px] font-bold mt-0.5">Library</span>
            </Link>
            
            <Link 
              href="/toolkit" 
              className={`flex flex-col items-center transition ${pathname === '/toolkit' ? 'text-[#FF5A36]' : 'text-[#8E8E93] hover:text-white'}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
              <span className="text-[9px] font-bold mt-0.5">AI Toolkit</span>
            </Link>
          </div>

        </div>
      </body>
    </html>
  );
}
