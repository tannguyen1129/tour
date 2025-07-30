'use client';
import { useQuery } from '@apollo/client';
import { GET_USERS } from '@/graphql/queries';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';

export default function AdminUsersPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { loading, error, data } = useQuery(GET_USERS);
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.push('/login');
    }
  }, [user, router]);

  // Loading state
  if (loading) {
    return (
      <AdminLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="bg-white p-12 rounded-3xl shadow-2xl border border-gray-100 text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <p className="text-xl font-semibold text-gray-700">Loading users...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <AdminLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="bg-red-50 border-2 border-red-200 p-12 rounded-3xl shadow-2xl max-w-2xl text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <div className="w-10 h-10 bg-red-500 rounded-full"></div>
            </div>
            <h3 className="text-2xl font-bold text-red-800 mb-4">Error Loading Users</h3>
            <p className="text-red-600 text-lg">{error.message}</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  // Redirect check
  if (!user || user.role !== 'admin') {
    return (
      <AdminLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="bg-white p-8 rounded-3xl shadow-2xl border border-gray-100">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-lg font-medium text-gray-700">Redirecting...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  // Filter users
  const filteredUsers = data?.users?.filter(u => {
    const statusMatch = statusFilter === 'all' || u.status === statusFilter;
    const roleMatch = roleFilter === 'all' || u.role === roleFilter;
    return statusMatch && roleMatch;
  }) || [];

  // Statistics
  const totalUsers = data?.users?.length || 0;
  const activeUsers = data?.users?.filter(u => u.status === 'active').length || 0;
  const adminUsers = data?.users?.filter(u => u.role === 'admin').length || 0;

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800 border-emerald-200';
      case 'inactive':
        return 'bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border-red-200';
      case 'pending':
        return 'bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border-gray-200';
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-gradient-to-r from-purple-100 to-violet-100 text-purple-800 border-purple-200';
      case 'user':
        return 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border-blue-200';
      case 'moderator':
        return 'bg-gradient-to-r from-orange-100 to-amber-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Hero Header with Stats */}
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-8 text-white relative overflow-hidden">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h1 className="text-4xl font-bold mb-3">User Management</h1>
                    <p className="text-blue-100 text-lg">Manage user accounts, roles and permissions</p>
                  </div>
                  <div className="hidden md:block">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                      </svg>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
                    <div className="text-3xl font-bold mb-2">{totalUsers}</div>
                    <div className="text-sm text-blue-100 uppercase tracking-wide font-medium">Total Users</div>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
                    <div className="text-3xl font-bold mb-2">{activeUsers}</div>
                    <div className="text-sm text-blue-100 uppercase tracking-wide font-medium">Active Users</div>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
                    <div className="text-3xl font-bold mb-2">{adminUsers}</div>
                    <div className="text-sm text-blue-100 uppercase tracking-wide font-medium">Admin Users</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Users List */}
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-8 border-b border-gray-200">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">User List</h2>
                  <p className="text-lg text-gray-600">Monitor and manage user accounts</p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex items-center space-x-3">
                    <label className="text-sm font-bold text-gray-800 uppercase tracking-wide">
                      Status:
                    </label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-4 py-2 border-2 border-gray-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white text-gray-900"
                    >
                      <option value="all">All Status</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="pending">Pending</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <label className="text-sm font-bold text-gray-800 uppercase tracking-wide">
                      Role:
                    </label>
                    <select
                      value={roleFilter}
                      onChange={(e) => setRoleFilter(e.target.value)}
                      className="px-4 py-2 border-2 border-gray-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white text-gray-900"
                    >
                      <option value="all">All Roles</option>
                      <option value="admin">Admin</option>
                      <option value="user">User</option>
                      <option value="moderator">Moderator</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-100 to-blue-100">
                  <tr>
                    <th className="px-8 py-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      User Info
                    </th>
                    <th className="px-8 py-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-8 py-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-8 py-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Join Date
                    </th>
                    <th className="px-8 py-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y-2 divide-gray-100">
                  {filteredUsers.map((u, index) => (
                    <tr key={u.id} className={`hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50 transition-all duration-300 ${
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                    }`}>
                      <td className="px-8 py-8 whitespace-nowrap">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-bold text-lg">
                              {u.email?.charAt(0)?.toUpperCase() || 'U'}
                            </span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-lg font-bold text-gray-900 truncate">
                              {u.name || 'Unknown User'}
                            </div>
                            <div className="text-sm text-gray-600 truncate">
                              {u.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-8 whitespace-nowrap">
                        <span className={`px-6 py-3 rounded-full text-sm font-bold uppercase tracking-wide border-2 shadow-sm ${getRoleColor(u.role)}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-8 py-8 whitespace-nowrap">
                        <span className={`px-6 py-3 rounded-full text-sm font-bold uppercase tracking-wide border-2 shadow-sm ${getStatusColor(u.status)}`}>
                          {u.status}
                        </span>
                      </td>
                      <td className="px-8 py-8 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-600">
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-GB') : 'Unknown'}
                        </div>
                      </td>
                      <td className="px-8 py-8 whitespace-nowrap">
                        <div className="flex flex-col sm:flex-row gap-3">
                          <button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg">
                            Edit
                          </button>
                          <button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg">
                            {u.status === 'active' ? 'Suspend' : 'Activate'}
                          </button>
                          <button className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg">
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Empty State */}
            {filteredUsers.length === 0 && (
              <div className="text-center py-20 bg-gradient-to-br from-gray-50 to-blue-50">
                <div className="max-w-lg mx-auto">
                  <div className="w-24 h-24 bg-gradient-to-br from-gray-200 to-blue-200 rounded-full mx-auto mb-8 flex items-center justify-center shadow-lg">
                    <svg className="w-12 h-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                    </svg>
                  </div>
                  <h3 className="text-3xl font-bold text-gray-800 mb-4">No Users Found</h3>
                  <p className="text-gray-600 text-xl mb-8 leading-relaxed">
                    {statusFilter === 'all' && roleFilter === 'all'
                      ? 'No users are currently registered in the system.'
                      : `No users match the current filter criteria.`
                    }
                  </p>
                  {(statusFilter !== 'all' || roleFilter !== 'all') && (
                    <button
                      onClick={() => {
                        setStatusFilter('all');
                        setRoleFilter('all');
                      }}
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
