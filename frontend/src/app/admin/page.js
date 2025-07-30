'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import AdminLayout from '../../components/AdminLayout';

export default function AdminDashboard() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!user || user.role !== 'admin') {
        router.push('/login');
      }
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100 flex items-center justify-center">
        <p className="text-gray-600 text-lg animate-pulse">Loading...</p>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100 flex items-center justify-center">
        <p className="text-gray-600 text-lg">Redirecting...</p>
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6 md:p-8 bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg border border-blue-100 min-h-[80vh]">
        {/* Header */}
        <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-emerald-500 to-teal-600 bg-clip-text text-transparent mb-6">
          Admin Dashboard
        </h1>

        {/* Welcome Message */}
        <div className="mb-8 p-4 bg-emerald-50/30 border border-emerald-100 rounded-xl">
          <p className="text-gray-700 text-base md:text-lg">
            Welcome, <span className="font-semibold text-emerald-600">{user.name || 'Admin'}</span>! Manage your tours, bookings, and users from here.
          </p>
        </div>

        {/* Dashboard Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300">
            <div className="text-3xl mb-2">📊</div>
            <h2 className="text-xl font-semibold text-gray-800 mb-1">Total Tours</h2>
            <p className="text-2xl font-bold text-emerald-600">0</p>
            <a href="/admin/tours" className="text-emerald-500 hover:text-emerald-700 text-sm mt-2 inline-block transition-colors duration-300">
              Manage Tours →
            </a>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300">
            <div className="text-3xl mb-2">📋</div>
            <h2 className="text-xl font-semibold text-gray-800 mb-1">Total Bookings</h2>
            <p className="text-2xl font-bold text-emerald-600">0</p>
            <a href="/admin/bookings" className="text-emerald-500 hover:text-emerald-700 text-sm mt-2 inline-block transition-colors duration-300">
              View Bookings →
            </a>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300">
            <div className="text-3xl mb-2">👥</div>
            <h2 className="text-xl font-semibold text-gray-800 mb-1">Total Users</h2>
            <p className="text-2xl font-bold text-emerald-600">0</p>
            <a href="/admin/users" className="text-emerald-500 hover:text-emerald-700 text-sm mt-2 inline-block transition-colors duration-300">
              Manage Users →
            </a>
          </div>
        </div>

        {/* Recent Activity Section */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Recent Activity</h2>
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <p className="text-gray-500 text-center py-4">No recent activity to display.</p>
            {/* Placeholder for dynamic content */}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button className="py-3 px-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300">
            Add New Tour
          </button>
          <button className="py-3 px-4 bg-white text-emerald-600 border-2 border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50 font-semibold rounded-xl shadow-md transform hover:-translate-y-1 transition-all duration-300">
            View Reports
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}
