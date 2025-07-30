'use client';
import { useQuery, useMutation } from '@apollo/client';
import { GET_TOUR_DETAIL, GET_CATEGORIES } from '@/graphql/queries';
import { UPDATE_TOUR, DELETE_TOUR } from '@/graphql/mutations';
import { useParams, useRouter } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function TourDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { loading, error, data, refetch } = useQuery(GET_TOUR_DETAIL, {
    variables: { id }
  });
  const { data: categoriesData } = useQuery(GET_CATEGORIES);
  
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [updateTour, { loading: updateLoading }] = useMutation(UPDATE_TOUR);
  const [deleteTour, { loading: deleteLoading }] = useMutation(DELETE_TOUR);

  // Edit form state
  const [editForm, setEditForm] = useState({
    title: '',
    price: '',
    location: '',
    itinerary: '',
    servicesIncluded: '',
    servicesExcluded: '',
    cancelPolicy: '',
    category: '',
    status: 'active',
    images: [],
    videos: []
  });

  // Build URL helper function
  const buildUrl = (path) => path?.startsWith('http') ? path : `${process.env.NEXT_PUBLIC_BACKEND_URL}${path}`;

  // Initialize edit form when tour data is loaded
  useEffect(() => {
    if (data?.tour) {
      const tour = data.tour;
      setEditForm({
        title: tour.title || '',
        price: tour.price || '',
        location: tour.location || '',
        itinerary: tour.itinerary || '',
        servicesIncluded: Array.isArray(tour.servicesIncluded) ? tour.servicesIncluded.join(', ') : '',
        servicesExcluded: Array.isArray(tour.servicesExcluded) ? tour.servicesExcluded.join(', ') : '',
        cancelPolicy: tour.cancelPolicy || '',
        category: tour.category?.id || '',
        status: tour.status || 'active',
        images: tour.images || [],
        videos: tour.videos || []
      });
    }
  }, [data?.tour]);

  // Loading state
  if (loading) {
    return (
      <AdminLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="bg-white p-12 rounded-3xl shadow-2xl border border-gray-100 text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <p className="text-xl font-semibold text-gray-700">Loading tour details...</p>
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
            <h3 className="text-2xl font-bold text-red-800 mb-4">Error Loading Tour</h3>
            <p className="text-red-600 text-lg">{error.message}</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const tour = data?.tour;

  if (!tour) {
    return (
      <AdminLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="bg-white p-12 rounded-3xl shadow-2xl border border-gray-100 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Tour Not Found</h3>
            <p className="text-gray-600">The tour you're looking for doesn't exist or has been removed.</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800 border-emerald-200';
      case 'draft':
        return 'bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border-yellow-200';
      case 'inactive':
        return 'bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border-red-200';
      default:
        return 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border-gray-200';
    }
  };

  // Handle edit form changes
  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  // Handle file upload
  const uploadFile = async (file, type) => {
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    const apiURL = process.env.NEXT_PUBLIC_BACKEND_URL
      ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/upload`
      : 'http://localhost:4000/api/upload';
    try {
      const res = await axios.post(apiURL, formData);
      if (type === 'image') {
        setEditForm(prev => ({
          ...prev,
          images: [...prev.images, res.data.url]
        }));
      } else {
        setEditForm(prev => ({
          ...prev,
          videos: [...prev.videos, res.data.url]
        }));
      }
    } catch (err) {
      console.error(err);
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  // Handle edit submit
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateTour({
        variables: {
          id,
          input: {
            title: editForm.title,
            price: parseFloat(editForm.price),
            location: editForm.location,
            itinerary: editForm.itinerary,
            servicesIncluded: editForm.servicesIncluded.split(',').map(s => s.trim()).filter(Boolean),
            servicesExcluded: editForm.servicesExcluded.split(',').map(s => s.trim()).filter(Boolean),
            cancelPolicy: editForm.cancelPolicy,
            category: editForm.category,
            status: editForm.status,
            images: editForm.images,
            videos: editForm.videos
          }
        }
      });
      alert('Tour updated successfully!');
      setIsEditing(false);
      refetch();
    } catch (err) {
      console.error('Error updating tour:', err);
      alert('Error updating tour: ' + err.message);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this tour? This action cannot be undone.')) {
      try {
        await deleteTour({ variables: { id } });
        alert('Tour deleted successfully!');
        router.push('/admin/tours');
      } catch (err) {
        console.error('Error deleting tour:', err);
        alert('Error deleting tour: ' + err.message);
      }
    }
  };

  // Handle cancel edit - reset form to original tour data
  const handleCancelEdit = () => {
    const tour = data.tour;
    setEditForm({
      title: tour.title || '',
      price: tour.price || '',
      location: tour.location || '',
      itinerary: tour.itinerary || '',
      servicesIncluded: Array.isArray(tour.servicesIncluded) ? tour.servicesIncluded.join(', ') : '',
      servicesExcluded: Array.isArray(tour.servicesExcluded) ? tour.servicesExcluded.join(', ') : '',
      cancelPolicy: tour.cancelPolicy || '',
      category: tour.category?.id || '',
      status: tour.status || 'active',
      images: tour.images || [],
      videos: tour.videos || []
    });
    setIsEditing(false);
  };

  // Remove image/video from edit form
  const removeEditImage = (index) => {
    setEditForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const removeEditVideo = (index) => {
    setEditForm(prev => ({
      ...prev,
      videos: prev.videos.filter((_, i) => i !== index)
    }));
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Hero Header */}
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-8 text-white relative overflow-hidden">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex-1 min-w-0">
                    <h1 className="text-4xl font-bold mb-3 truncate">
                      {isEditing ? 'Edit Tour' : tour.title}
                    </h1>
                    <p className="text-blue-100 text-lg">
                      {isEditing ? 'Update tour information' : 'Tour Details & Information'}
                    </p>
                  </div>
                  <div className="hidden md:block">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                      </svg>
                    </div>
                  </div>
                </div>
                
                {!isEditing && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 border border-white/30">
                      <div className="text-2xl font-bold mb-1">${tour.price}</div>
                      <div className="text-sm text-blue-100 uppercase tracking-wide font-medium">Price</div>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 border border-white/30">
                      <div className="text-lg font-bold mb-1 truncate">{tour.location}</div>
                      <div className="text-sm text-blue-100 uppercase tracking-wide font-medium">Location</div>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 border border-white/30">
                      <div className="text-lg font-bold mb-1 truncate">{tour.category?.name || 'N/A'}</div>
                      <div className="text-sm text-blue-100 uppercase tracking-wide font-medium">Category</div>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 border border-white/30">
                      <span className={`px-3 py-1 rounded-full text-sm font-bold uppercase tracking-wide border shadow-sm ${getStatusColor(tour.status)} bg-white`}>
                        {tour.status}
                      </span>
                      <div className="text-sm text-blue-100 uppercase tracking-wide font-medium mt-1">Status</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Edit Form */}
          {isEditing && (
            <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
              <form onSubmit={handleEditSubmit} className="p-8 space-y-8">
                
                {/* Basic Information */}
                <div className="space-y-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Basic Information</h3>
                  </div>

                  {/* Fixed grid layout để tránh tràn xuống */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="block text-sm font-bold text-gray-800 uppercase tracking-wide">
                        Tour Title
                      </label>
                      <input
                        name="title"
                        value={editForm.title}
                        onChange={handleEditChange}
                        className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-300 text-gray-900 font-semibold bg-gray-50 focus:bg-white shadow-sm"
                        required
                      />
                    </div>

                    <div className="space-y-3">
                      <label className="block text-sm font-bold text-gray-800 uppercase tracking-wide">
                        Price ($)
                      </label>
                      <input
                        name="price"
                        type="number"
                        min="0"
                        step="0.01"
                        value={editForm.price}
                        onChange={handleEditChange}
                        className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-300 text-gray-900 font-semibold bg-gray-50 focus:bg-white shadow-sm"
                        required
                      />
                    </div>

                    <div className="space-y-3">
                      <label className="block text-sm font-bold text-gray-800 uppercase tracking-wide">
                        Location
                      </label>
                      <input
                        name="location"
                        value={editForm.location}
                        onChange={handleEditChange}
                        className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-300 text-gray-900 font-semibold bg-gray-50 focus:bg-white shadow-sm"
                        required
                      />
                    </div>

                    <div className="space-y-3">
                      <label className="block text-sm font-bold text-gray-800 uppercase tracking-wide">
                        Category
                      </label>
                      <select
                        name="category"
                        value={editForm.category}
                        onChange={handleEditChange}
                        className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-300 text-gray-900 font-semibold bg-gray-50 focus:bg-white shadow-sm"
                        required
                      >
                        <option value="">Select Category</option>
                        {categoriesData?.categories?.map(cat => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-3">
                      <label className="block text-sm font-bold text-gray-800 uppercase tracking-wide">
                        Status
                      </label>
                      <select
                        name="status"
                        value={editForm.status}
                        onChange={handleEditChange}
                        className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-300 text-gray-900 font-semibold bg-gray-50 focus:bg-white shadow-sm"
                      >
                        <option value="active">Active</option>
                        <option value="draft">Draft</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>

                    {/* Cancellation Policy - full width để không bị tràn */}
                    <div className="space-y-3 md:col-span-2">
                      <label className="block text-sm font-bold text-gray-800 uppercase tracking-wide">
                        Cancellation Policy
                      </label>
                      <input
                        name="cancelPolicy"
                        value={editForm.cancelPolicy}
                        onChange={handleEditChange}
                        className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-300 text-gray-900 font-semibold bg-gray-50 focus:bg-white shadow-sm"
                        placeholder="Enter cancellation policy details..."
                      />
                    </div>
                  </div>
                </div>

                {/* Tour Details */}
                <div className="space-y-6 pt-8 border-t border-gray-200">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Tour Details</h3>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-3">
                      <label className="block text-sm font-bold text-gray-800 uppercase tracking-wide">
                        Itinerary Description
                      </label>
                      <textarea
                        name="itinerary"
                        value={editForm.itinerary}
                        onChange={handleEditChange}
                        rows="6"
                        className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-300 text-gray-900 resize-none bg-gray-50 focus:bg-white shadow-sm"
                        placeholder="Describe the detailed tour itinerary..."
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <label className="block text-sm font-bold text-gray-800 uppercase tracking-wide">
                          Services Included
                        </label>
                        <textarea
                          name="servicesIncluded"
                          value={editForm.servicesIncluded}
                          onChange={handleEditChange}
                          rows="4"
                          placeholder="Separate services with commas"
                          className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-300 text-gray-900 resize-none bg-gray-50 focus:bg-white shadow-sm"
                        />
                      </div>

                      <div className="space-y-3">
                        <label className="block text-sm font-bold text-gray-800 uppercase tracking-wide">
                          Services Excluded
                        </label>
                        <textarea
                          name="servicesExcluded"
                          value={editForm.servicesExcluded}
                          onChange={handleEditChange}
                          rows="4"
                          placeholder="Separate services with commas"
                          className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-300 text-gray-900 resize-none bg-gray-50 focus:bg-white shadow-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Media Upload */}
                <div className="space-y-6 pt-8 border-t border-gray-200">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Media Files</h3>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Images */}
                    <div className="space-y-4">
                      <label className="block text-sm font-bold text-gray-800 uppercase tracking-wide">
                        Tour Images
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => {
                          Array.from(e.target.files).forEach(file => uploadFile(file, 'image'));
                        }}
                        className="w-full px-6 py-4 border-2 border-dashed border-gray-300 rounded-2xl bg-gray-50 hover:bg-gray-100 text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-blue-50 file:text-blue-700 cursor-pointer"
                        disabled={uploading}
                      />
                      {editForm.images.length > 0 && (
                        <div className="grid grid-cols-3 gap-4">
                          {editForm.images.map((url, idx) => (
                            <div key={idx} className="relative group">
                              <img
                                src={buildUrl(url)}
                                alt={`Image ${idx + 1}`}
                                className="w-full h-20 object-cover rounded-xl shadow-sm border border-gray-200"
                              />
                              <button
                                type="button"
                                onClick={() => removeEditImage(idx)}
                                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Videos */}
                    <div className="space-y-4">
                      <label className="block text-sm font-bold text-gray-800 uppercase tracking-wide">
                        Tour Videos
                      </label>
                      <input
                        type="file"
                        accept="video/*"
                        multiple
                        onChange={(e) => {
                          Array.from(e.target.files).forEach(file => uploadFile(file, 'video'));
                        }}
                        className="w-full px-6 py-4 border-2 border-dashed border-gray-300 rounded-2xl bg-gray-50 hover:bg-gray-100 text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-purple-50 file:text-purple-700 cursor-pointer"
                        disabled={uploading}
                      />
                      {editForm.videos.length > 0 && (
                        <div className="space-y-4">
                          {editForm.videos.map((url, idx) => (
                            <div key={idx} className="relative group">
                              <video
                                src={buildUrl(url)}
                                controls
                                className="w-full h-32 object-cover rounded-xl shadow-sm border border-gray-200"
                              />
                              <button
                                type="button"
                                onClick={() => removeEditVideo(idx)}
                                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-8 border-t border-gray-200">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <button
                      type="submit"
                      disabled={updateLoading || uploading}
                      className="flex-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 disabled:from-gray-400 disabled:via-gray-500 disabled:to-gray-600 text-white px-10 py-5 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 disabled:hover:transform-none transition-all duration-300"
                    >
                      {updateLoading ? (
                        <div className="flex items-center justify-center space-x-3">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                          <span>Updating...</span>
                        </div>
                      ) : uploading ? (
                        <div className="flex items-center justify-center space-x-3">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                          <span>Uploading...</span>
                        </div>
                      ) : (
                        'Update Tour'
                      )}
                    </button>
                    
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="px-10 py-5 border-2 border-gray-300 hover:border-gray-400 text-gray-700 hover:text-gray-900 rounded-2xl font-bold text-lg hover:bg-gray-50 transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* View Mode Content */}
          {!isEditing && (
            <>
              {/* Main Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Tour Information */}
                <div className="lg:col-span-2 space-y-8">
                  
                  {/* Description & Itinerary */}
                  <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
                    <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-8 border-b border-gray-200">
                      <h2 className="text-3xl font-bold text-gray-900 mb-2">Tour Information</h2>
                      <p className="text-lg text-gray-600">Detailed tour description and itinerary</p>
                    </div>
                    
                    <div className="p-8 space-y-8">
                      {tour.description && (
                        <div>
                          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center space-x-2">
                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>Description</span>
                          </h3>
                          <p className="text-gray-700 leading-relaxed text-base bg-gray-50 rounded-xl p-6">{tour.description}</p>
                        </div>
                      )}
                      
                      <div>
                        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center space-x-2">
                          <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                          <span>Itinerary</span>
                        </h3>
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                          <p className="text-gray-700 leading-relaxed text-base">{tour.itinerary}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Services */}
                  <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
                    <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-8 border-b border-gray-200">
                      <h2 className="text-3xl font-bold text-gray-900 mb-2">Services & Policies</h2>
                      <p className="text-lg text-gray-600">What's included, excluded, and cancellation policy</p>
                    </div>
                    
                    <div className="p-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                          <div>
                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center space-x-2">
                              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              <span>Services Included</span>
                            </h3>
                            <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                              <p className="text-gray-700 text-sm leading-relaxed">
                                {tour.servicesIncluded?.join(', ') || 'Not specified'}
                              </p>
                            </div>
                          </div>
                          
                          <div>
                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center space-x-2">
                              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                              <span>Services Excluded</span>
                            </h3>
                            <div className="bg-red-50 rounded-xl p-4 border border-red-100">
                              <p className="text-gray-700 text-sm leading-relaxed">
                                {tour.servicesExcluded?.join(', ') || 'Not specified'}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center space-x-2">
                            <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                            <span>Cancellation Policy</span>
                          </h3>
                          <div className="bg-amber-50 rounded-xl p-4 border border-amber-100 h-full">
                            <p className="text-gray-700 text-sm leading-relaxed">
                              {tour.cancelPolicy || 'Not specified'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Media Sidebar */}
                <div className="space-y-8">
                  
                  {/* Images */}
                  <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
                    <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-6 border-b border-gray-200">
                      <h3 className="text-2xl font-bold text-gray-900 mb-1">Tour Images</h3>
                      <p className="text-gray-600">{tour.images?.length || 0} images</p>
                    </div>
                    
                    <div className="p-6">
                      {tour.images?.length > 0 ? (
                        <div className="grid grid-cols-2 gap-4">
                          {tour.images.map((img, idx) => (
                            <div key={idx} className="relative group">
                              <img
                                src={buildUrl(img)}
                                alt={`Tour image ${idx + 1}`}
                                className="w-full h-24 object-cover rounded-xl shadow-sm border border-gray-200 group-hover:scale-105 transition-transform duration-200 cursor-pointer"
                                onClick={() => setSelectedImage(buildUrl(img))}
                                onError={(e) => {
                                  e.target.src = 'https://via.placeholder.com/200x200/e2e8f0/64748b?text=No+Image';
                                }}
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 rounded-xl flex items-center justify-center">
                                <svg className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                                </svg>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <p className="text-gray-500 text-sm">No images uploaded</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Videos */}
                  <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
                    <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-6 border-b border-gray-200">
                      <h3 className="text-2xl font-bold text-gray-900 mb-1">Tour Videos</h3>
                      <p className="text-gray-600">{tour.videos?.length || 0} videos</p>
                    </div>
                    
                    <div className="p-6">
                      {tour.videos?.length > 0 ? (
                        <div className="space-y-4">
                          {tour.videos.map((vid, idx) => (
                            <div key={idx} className="relative group">
                              <video
                                src={buildUrl(vid)}
                                className="w-full h-32 rounded-xl shadow-sm border border-gray-200 cursor-pointer"
                                controls
                                onClick={() => setSelectedVideo(buildUrl(vid))}
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                }}
                              />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <p className="text-gray-500 text-sm">No videos uploaded</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
                    <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-6 border-b border-gray-200">
                      <h3 className="text-2xl font-bold text-gray-900 mb-1">Actions</h3>
                      <p className="text-gray-600">Manage this tour</p>
                    </div>
                    
                    <div className="p-6 space-y-4">
                      <button 
                        onClick={() => setIsEditing(true)}
                        className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-4 rounded-xl font-bold transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg"
                      >
                        Edit Tour
                      </button>
                      <button 
                        onClick={() => router.push(`/tours/${tour.id}`)}
                        className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-6 py-4 rounded-xl font-bold transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg"
                      >
                        View Public Page
                      </button>
                      <button 
                        onClick={handleDelete}
                        disabled={deleteLoading}
                        className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-6 py-4 rounded-xl font-bold transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg disabled:cursor-not-allowed"
                      >
                        {deleteLoading ? (
                          <div className="flex items-center justify-center space-x-2">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            <span>Deleting...</span>
                          </div>
                        ) : (
                          'Delete Tour'
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-full">
            <img
              src={selectedImage}
              alt="Enlarged view"
              className="max-w-full max-h-full object-contain rounded-2xl"
            />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Video Modal */}
      {selectedVideo && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedVideo(null)}
        >
          <div className="relative max-w-4xl max-h-full">
            <video
              src={selectedVideo}
              className="max-w-full max-h-full rounded-2xl"
              controls
              autoPlay
            />
            <button
              onClick={() => setSelectedVideo(null)}
              className="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            </div>
        </div>
      )}
    </AdminLayout>
  );
}
