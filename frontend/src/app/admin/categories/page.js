'use client';
import { useQuery, useMutation } from '@apollo/client';
import { GET_CATEGORIES } from '@/graphql/queries';
import {
  CREATE_CATEGORY,
  UPDATE_CATEGORY,
  DELETE_CATEGORY,
} from '@/graphql/mutations';
import { useState } from 'react';
import AdminLayout from '@/components/AdminLayout';

export default function ManageCategoriesPage() {
  const { loading, error, data, refetch } = useQuery(GET_CATEGORIES);
  const [createCategory] = useMutation(CREATE_CATEGORY);
  const [updateCategory] = useMutation(UPDATE_CATEGORY);
  const [deleteCategory] = useMutation(DELETE_CATEGORY);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [editingId, setEditingId] = useState(null);

  // Loading state component
  if (loading) {
    return (
      <AdminLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="bg-white p-12 rounded-3xl shadow-2xl border border-gray-100 text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <p className="text-xl font-semibold text-gray-700">Loading categories...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  // Error state component
  if (error) {
    return (
      <AdminLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="bg-red-50 border-2 border-red-200 p-12 rounded-3xl shadow-2xl max-w-2xl text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <div className="w-10 h-10 bg-red-500 rounded-full"></div>
            </div>
            <h3 className="text-2xl font-bold text-red-800 mb-4">Error Loading Categories</h3>
            <p className="text-red-600 text-lg mb-4">{error.message}</p>
            <pre className="text-xs text-red-400 bg-red-100 p-4 rounded-xl overflow-auto max-h-40">
              {JSON.stringify(error, null, 2)}
            </pre>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Name is required');
      return;
    }
    try {
      if (editingId) {
        await updateCategory({
          variables: {
            id: editingId,
            name,
            description,
          },
        });
      } else {
        await createCategory({
          variables: {
            name,
            description,
          },
        });
      }

      setName('');
      setDescription('');
      setEditingId(null);
      await refetch();
    } catch (err) {
      console.error('Save category error:', err);
      alert('Failed to save category');
    }
  };

  const handleEdit = (cat) => {
    setName(cat.name || '');
    setDescription(cat.description || '');
    setEditingId(cat.id);
  };

  const handleCancel = () => {
    setName('');
    setDescription('');
    setEditingId(null);
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this category?')) {
      try {
        await deleteCategory({ variables: { id } });
        await refetch();
      } catch (err) {
        console.error('Delete category error:', err);
        alert('Failed to delete category');
      }
    }
  };

  const totalCategories = data?.categories?.length || 0;

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* Hero Header with Stats */}
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-8 text-white relative overflow-hidden">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h1 className="text-4xl font-bold mb-3">Category Management</h1>
                    <p className="text-blue-100 text-lg">Organize your tours and products with categories</p>
                  </div>
                  <div className="hidden md:block">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
                    <div className="text-3xl font-bold mb-2">{totalCategories}</div>
                    <div className="text-sm text-blue-100 uppercase tracking-wide font-medium">Total Categories</div>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
                    <div className="text-3xl font-bold mb-2">{editingId ? 'Edit' : 'Create'}</div>
                    <div className="text-sm text-blue-100 uppercase tracking-wide font-medium">Current Mode</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form Section */}
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-8 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    {editingId ? 'Edit Category' : 'Create New Category'}
                  </h2>
                  <p className="text-lg text-gray-600">
                    {editingId ? 'Update category information below' : 'Add a new category to organize your content'}
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                
                <div className="space-y-3">
                  <label className="block text-sm font-bold text-gray-800 uppercase tracking-wide mb-3">
                    Category Name
                  </label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter category name"
                    className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-300 text-gray-900 font-semibold placeholder-gray-400 bg-gray-50 focus:bg-white shadow-sm"
                    required
                  />
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-bold text-gray-800 uppercase tracking-wide mb-3">
                    Description
                  </label>
                  <input
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter category description"
                    className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-300 text-gray-900 font-semibold placeholder-gray-400 bg-gray-50 focus:bg-white shadow-sm"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-6">
                <button 
                  type="submit" 
                  className="flex-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white px-10 py-5 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 transition-all duration-300"
                >
                  {editingId ? 'Update Category' : 'Create Category'}
                </button>
                
                {editingId && (
                  <button 
                    type="button"
                    onClick={handleCancel}
                    className="px-10 py-5 border-2 border-gray-300 hover:border-gray-400 text-gray-700 hover:text-gray-900 rounded-2xl font-bold text-lg hover:bg-gray-50 transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    Cancel Edit
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Categories List */}
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-8 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Category List</h2>
                  <p className="text-lg text-gray-600">Manage your existing categories</p>
                </div>
                <div className="bg-gradient-to-r from-blue-100 to-indigo-100 px-6 py-3 rounded-full border border-blue-200">
                  <span className="text-blue-800 font-bold text-lg">{totalCategories} Categories</span>
                </div>
              </div>
            </div>

            <div className="p-8">
              {data?.categories?.length > 0 ? (
                <div className="grid gap-6">
                  {data.categories.map((cat, index) => (
                    <div
                      key={cat.id}
                      className={`group p-6 border-2 border-gray-200 rounded-2xl hover:border-blue-300 hover:shadow-lg transition-all duration-300 ${
                        editingId === cat.id 
                          ? 'bg-blue-50 border-blue-300 shadow-lg' 
                          : 'bg-white hover:bg-gray-50'
                      } ${index % 2 === 0 ? 'lg:hover:scale-[1.02]' : ''}`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-3 mb-2">
                            <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex-shrink-0"></div>
                            <h3 className="text-xl font-bold text-gray-900 truncate">{cat.name}</h3>
                            {editingId === cat.id && (
                              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                                Editing
                              </span>
                            )}
                          </div>
                          <p className="text-gray-600 text-base leading-relaxed">
                            {cat.description || 'No description provided'}
                          </p>
                        </div>
                        
                        <div className="flex items-center space-x-4 flex-shrink-0">
                          <button
                            onClick={() => handleEdit(cat)}
                            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(cat.id)}
                            className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl">
                  <div className="max-w-md mx-auto">
                    <div className="w-24 h-24 bg-gradient-to-br from-gray-200 to-blue-200 rounded-full mx-auto mb-8 flex items-center justify-center shadow-lg">
                      <svg className="w-12 h-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-800 mb-4">No Categories Found</h3>
                    <p className="text-gray-600 text-xl mb-8 leading-relaxed">
                      Start organizing your content by creating your first category above.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
