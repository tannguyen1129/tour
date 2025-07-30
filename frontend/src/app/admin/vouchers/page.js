'use client';
import { useEffect, useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import {
  GET_VOUCHERS,
} from '@/graphql/queries';
import {
  CREATE_VOUCHER,
  UPDATE_VOUCHER,
  DELETE_VOUCHER,
} from '@/graphql/mutations';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';

const isValidDate = (dateStr) => {
  const d = new Date(dateStr);
  return dateStr && !isNaN(d.getTime());
};

export default function AdminVouchersPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({
    code: '',
    type: 'percentage',
    value: 0,
    conditions: '',
    validFrom: '',
    validTo: '',
    status: 'active',
  });
  const [editingId, setEditingId] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');

  const { loading, error, data, refetch } = useQuery(GET_VOUCHERS);
  const [createVoucher] = useMutation(CREATE_VOUCHER);
  const [updateVoucher] = useMutation(UPDATE_VOUCHER);
  const [deleteVoucher] = useMutation(DELETE_VOUCHER);

  const toISOStringOrNull = (value) => {
    return value ? new Date(value).toISOString() : null;
  };

  useEffect(() => {
    if (!user || user.role !== 'admin') router.push('/login');
  }, [user, router]);

  if (!user || user.role !== 'admin') {
    return (
      <AdminLayout>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
          <div className="bg-white p-8 rounded-3xl shadow-2xl border border-gray-100">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-6"></div>
            <p className="text-xl font-semibold text-gray-700 text-center">Redirecting to login...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
          <div className="bg-white p-8 rounded-3xl shadow-2xl border border-gray-100">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-6"></div>
            <p className="text-xl font-semibold text-gray-700 text-center">Loading vouchers...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
          <div className="bg-red-50 border-2 border-red-200 p-8 rounded-3xl shadow-2xl max-w-lg text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <div className="w-10 h-10 bg-red-500 rounded-full"></div>
            </div>
            <h3 className="text-2xl font-bold text-red-800 mb-4">Error Loading Vouchers</h3>
            <p className="text-red-600 text-lg">{error.message}</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        value: parseFloat(form.value),
        validFrom: toISOStringOrNull(form.validFrom),
        validTo: toISOStringOrNull(form.validTo),
      };

      if (editingId) {
        await updateVoucher({ variables: { id: editingId, ...payload } });
      } else {
        await createVoucher({ variables: payload });
      }

      setForm({
        code: '',
        type: 'percentage',
        value: 0,
        conditions: '',
        validFrom: '',
        validTo: '',
        status: 'active',
      });
      setEditingId(null);
      refetch();
    } catch (err) {
      console.error('Error saving voucher:', err.message);
    }
  };

  const handleEdit = (v) => {
    setForm({
      code: v.code || '',
      type: v.type || 'percentage',
      value: v.value || 0,
      conditions: v.conditions || '',
      validFrom: v.validFrom ? v.validFrom.slice(0, 10) : '',
      validTo: v.validTo ? v.validTo.slice(0, 10) : '',
      status: v.status || 'active',
    });
    setEditingId(v.id);
  };

  const handleDelete = async (id) => {
    if (confirm('Delete this voucher?')) {
      await deleteVoucher({ variables: { id } });
      refetch();
    }
  };

  const filteredVouchers = statusFilter === 'all'
    ? data.vouchers
    : data.vouchers.filter(v => v.status === statusFilter);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800 border-emerald-200';
      case 'inactive':
        return 'bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border-red-200';
      default:
        return 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border-gray-200';
    }
  };

  const totalVouchers = data?.vouchers?.length || 0;
  const activeVouchers = data?.vouchers?.filter(v => v.status === 'active').length || 0;
  const inactiveVouchers = data?.vouchers?.filter(v => v.status === 'inactive').length || 0;

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Modern Header with Stats */}
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-8 text-white relative overflow-hidden">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h1 className="text-4xl font-bold mb-3">Voucher Management</h1>
                    <p className="text-blue-100 text-lg">Create, manage and track your discount vouchers</p>
                  </div>
                  <div className="hidden md:block">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30">
                      <div className="w-8 h-8 bg-white rounded-full"></div>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
                    <div className="text-3xl font-bold mb-2">{totalVouchers}</div>
                    <div className="text-sm text-blue-100 uppercase tracking-wide font-medium">Total Vouchers</div>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
                    <div className="text-3xl font-bold mb-2">{activeVouchers}</div>
                    <div className="text-sm text-blue-100 uppercase tracking-wide font-medium">Active Vouchers</div>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
                    <div className="text-3xl font-bold mb-2">{inactiveVouchers}</div>
                    <div className="text-sm text-blue-100 uppercase tracking-wide font-medium">Inactive Vouchers</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Form Section */}
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-8 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    {editingId ? 'Edit Voucher' : 'Create New Voucher'}
                  </h2>
                  <p className="text-lg text-gray-600">
                    {editingId ? 'Update voucher information below' : 'Fill in the details to create a new voucher'}
                  </p>
                </div>
                {editingId && (
                  <div className="bg-blue-100 text-blue-800 px-6 py-3 rounded-full text-sm font-bold uppercase tracking-wide border border-blue-200">
                    Edit Mode
                  </div>
                )}
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 mb-10">
                
                <div className="space-y-3">
                  <label className="block text-sm font-bold text-gray-800 uppercase tracking-wide mb-3">
                    Voucher Code
                  </label>
                  <input
                    className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-300 text-gray-900 font-semibold placeholder-gray-400 bg-gray-50 focus:bg-white shadow-sm"
                    placeholder="Enter unique voucher code"
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-bold text-gray-800 uppercase tracking-wide mb-3">
                    Discount Type
                  </label>
                  <select
                    className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-300 text-gray-900 font-semibold bg-gray-50 focus:bg-white shadow-sm"
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                  >
                    <option value="percentage">Percentage Discount</option>
                    <option value="fixed">Fixed Amount</option>
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-bold text-gray-800 uppercase tracking-wide mb-3">
                    Discount Value {form.type === 'percentage' ? '(%)' : '($)'}
                  </label>
                  <div className="relative">
                    <input
                      className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-300 text-gray-900 font-semibold placeholder-gray-400 bg-gray-50 focus:bg-white pr-16 shadow-sm"
                      type="number"
                      min="0"
                      step={form.type === 'percentage' ? '1' : '0.01'}
                      placeholder={form.type === 'percentage' ? '10' : '50.00'}
                      value={form.value}
                      onChange={(e) => setForm({ ...form, value: parseFloat(e.target.value) })}
                      required
                    />
                    <div className="absolute right-6 top-1/2 transform -translate-y-1/2 text-gray-500 font-bold text-lg">
                      {form.type === 'percentage' ? '%' : '$'}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-bold text-gray-800 uppercase tracking-wide mb-3">
                    Valid From
                  </label>
                  <input
                    className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-300 text-gray-900 font-semibold bg-gray-50 focus:bg-white shadow-sm"
                    type="date"
                    value={form.validFrom}
                    onChange={(e) => setForm({ ...form, validFrom: e.target.value })}
                  />
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-bold text-gray-800 uppercase tracking-wide mb-3">
                    Valid Until
                  </label>
                  <input
                    className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-300 text-gray-900 font-semibold bg-gray-50 focus:bg-white shadow-sm"
                    type="date"
                    value={form.validTo}
                    onChange={(e) => setForm({ ...form, validTo: e.target.value })}
                  />
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-bold text-gray-800 uppercase tracking-wide mb-3">
                    Status
                  </label>
                  <select
                    className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-300 text-gray-900 font-semibold bg-gray-50 focus:bg-white shadow-sm"
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="space-y-3 mb-10">
                <label className="block text-sm font-bold text-gray-800 uppercase tracking-wide mb-3">
                  Usage Conditions & Requirements
                </label>
                <textarea
                  className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-300 text-gray-900 placeholder-gray-400 resize-none bg-gray-50 focus:bg-white shadow-sm"
                  placeholder="Describe any conditions or requirements for this voucher (e.g., minimum order amount, customer eligibility, etc.)"
                  rows="4"
                  value={form.conditions}
                  onChange={(e) => setForm({ ...form, conditions: e.target.value })}
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-6">
                <button 
                  type="submit" 
                  className="flex-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white px-10 py-5 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 transition-all duration-300"
                >
                  {editingId ? 'Update Voucher' : 'Create Voucher'}
                </button>
                
                {editingId && (
                  <button 
                    type="button"
                    onClick={() => {
                      setForm({
                        code: '',
                        type: 'percentage',
                        value: 0,
                        conditions: '',
                        validFrom: '',
                        validTo: '',
                        status: 'active',
                      });
                      setEditingId(null);
                    }}
                    className="px-10 py-5 border-2 border-gray-300 hover:border-gray-400 text-gray-700 hover:text-gray-900 rounded-2xl font-bold text-lg hover:bg-gray-50 transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    Cancel Edit
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Modern Vouchers List */}
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-8 border-b border-gray-200">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Voucher List</h2>
                  <p className="text-lg text-gray-600">Manage and monitor your existing vouchers</p>
                </div>
                
                <div className="flex items-center space-x-4">
                  <label className="text-sm font-bold text-gray-800 uppercase tracking-wide">
                    Filter Status:
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-6 py-3 border-2 border-gray-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white text-gray-900 shadow-sm"
                  >
                    <option value="all">All Vouchers</option>
                    <option value="active">Active Only</option>
                    <option value="inactive">Inactive Only</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-100 to-blue-100">
                  <tr>
                    <th className="px-8 py-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Voucher Code
                    </th>
                    <th className="px-8 py-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-8 py-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Value
                    </th>
                    <th className="px-8 py-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-8 py-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Validity Period
                    </th>
                    <th className="px-8 py-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y-2 divide-gray-100">
                  {filteredVouchers.map((v, index) => (
                    <tr key={v.id} className={`hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50 transition-all duration-300 ${
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                    }`}>
                      <td className="px-8 py-8 whitespace-nowrap">
                        <div className="bg-gradient-to-r from-blue-100 to-indigo-100 px-6 py-3 rounded-full border-2 border-blue-200 shadow-sm">
                          <span className="text-sm font-bold text-blue-800 uppercase tracking-wide">
                            {v.code}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-8 whitespace-nowrap">
                        <span className={`px-6 py-3 rounded-full text-sm font-bold uppercase tracking-wide border-2 shadow-sm ${
                          v.type === 'percentage' 
                            ? 'bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800 border-emerald-200' 
                            : 'bg-gradient-to-r from-purple-100 to-violet-100 text-purple-800 border-purple-200'
                        }`}>
                          {v.type === 'percentage' ? 'Percentage' : 'Fixed Amount'}
                        </span>
                      </td>
                      <td className="px-8 py-8 whitespace-nowrap">
                        <div className="text-xl font-bold text-gray-900">
                          {v.type === 'percentage' ? `${v.value}%` : `$${v.value}`}
                        </div>
                      </td>
                      <td className="px-8 py-8 whitespace-nowrap">
                        <span className={`px-6 py-3 rounded-full text-sm font-bold uppercase tracking-wide border-2 shadow-sm ${getStatusColor(v.status)}`}>
                          {v.status}
                        </span>
                      </td>
                      <td className="px-8 py-8 whitespace-nowrap">
                        <div className="space-y-2 text-sm font-medium text-gray-600">
                          <div className="flex items-center space-x-2">
                            <span className="text-gray-400">From:</span>
                            <span className="font-semibold">
                              {isValidDate(v.validFrom) 
                                ? new Date(v.validFrom).toLocaleDateString('en-GB')
                                : 'No start date'
                              }
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-gray-400">Until:</span>
                            <span className="font-semibold">
                              {isValidDate(v.validTo)
                                ? new Date(v.validTo).toLocaleDateString('en-GB')
                                : 'No end date'
                              }
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-8 whitespace-nowrap">
                        <div className="flex flex-col sm:flex-row gap-3">
                          <button 
                            onClick={() => handleEdit(v)} 
                            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg"
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDelete(v.id)} 
                            className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Enhanced Empty State */}
            {filteredVouchers.length === 0 && (
              <div className="text-center py-20 bg-gradient-to-br from-gray-50 to-blue-50">
                <div className="max-w-lg mx-auto">
                  <div className="w-24 h-24 bg-gradient-to-br from-gray-200 to-blue-200 rounded-full mx-auto mb-8 flex items-center justify-center shadow-lg">
                    <div className="w-12 h-12 bg-white rounded-full"></div>
                  </div>
                  <h3 className="text-3xl font-bold text-gray-800 mb-4">No Vouchers Found</h3>
                  <p className="text-gray-600 text-xl mb-8 leading-relaxed">
                    {statusFilter === 'all' 
                      ? 'Create your first voucher to start offering discounts to your customers.' 
                      : `No ${statusFilter} vouchers are currently available in your system.`
                    }
                  </p>
                  {statusFilter !== 'all' && (
                    <button
                      onClick={() => setStatusFilter('all')}
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg"
                    >
                      View All Vouchers
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
