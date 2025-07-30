'use client';
import AdminSidebar from './AdminSidebar';
import { useState } from 'react';

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:sticky top-0 h-screen z-50 lg:z-20
        w-80 transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900
        shadow-2xl border-r border-white/10 overflow-y-auto
      `}>
        {/* Decorative Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl"></div>
          <div className="absolute top-1/3 -right-10 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl"></div>
          <div className="absolute bottom-20 left-10 w-24 h-24 bg-purple-500/10 rounded-full blur-xl"></div>
        </div>

        {/* Logo/Brand Section */}
        <div className="relative z-10 p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-2xl font-bold text-white truncate">TourAdmin</h2>
                <p className="text-blue-200/80 text-sm font-medium truncate">Management Portal</p>
              </div>
            </div>
            
            {/* Mobile Close Button */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center text-white hover:bg-white/20 transition-colors flex-shrink-0 ml-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Admin Info Card */}
        <div className="relative z-10 p-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-white font-semibold truncate">Administrator</p>
                <p className="text-blue-200/80 text-sm truncate">System Manager</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Navigation */}
        <div className="relative z-10 px-6 pb-6 flex-1">
          <AdminSidebar />
        </div>

        {/* Bottom Decoration */}
        <div className="relative z-10 p-6 mt-auto">
          <div className="bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-2xl p-4 border border-white/10">
            <div className="flex items-center space-x-2 text-blue-200">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="text-sm font-medium truncate">Powered by TourBooking</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white/95 backdrop-blur-sm border-b border-slate-200 p-4 sticky top-0 z-30 shadow-sm">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white hover:bg-blue-700 transition-colors shadow-lg flex-shrink-0"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-xl font-bold text-slate-800 truncate mx-4">Admin Dashboard</h1>
            <div className="w-10 h-10 flex-shrink-0"></div> {/* Spacer */}
          </div>
        </div>

        {/* Content Area */}
        <div className="p-4 lg:p-6 xl:p-8 relative">
          <div className="w-full max-w-none">
            {/* Content Container */}
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
              {/* Content Header Decoration */}
              <div className="h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600"></div>
              
              {/* Main Content */}
              <div className="p-4 sm:p-6 lg:p-8 overflow-x-auto">
                <div className="min-w-0 w-full">
                  {children}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Background Decorations */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
          <div className="absolute top-20 right-20 w-64 h-64 bg-blue-400/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-20 w-48 h-48 bg-indigo-400/5 rounded-full blur-2xl"></div>
        </div>
      </main>
    </div>
  );
}
