'use client';
import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { CREATE_TOUR } from '@/graphql/mutations';
import axios from 'axios';

export default function CreateTourForm({ onCreated, categories = [] }) {
  const [form, setForm] = useState({
    title: '',
    price: '',
    location: '',
    itinerary: '',
    servicesIncluded: '',
    servicesExcluded: '',
    cancelPolicy: '',
    category: '',
    status: 'active'
  });
  const [images, setImages] = useState([]);
  const [videos, setVideos] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [createTour, { loading, error }] = useMutation(CREATE_TOUR);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

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
        setImages(prev => [...prev, res.data.url]);
      } else {
        setVideos(prev => [...prev, res.data.url]);
      }
    } catch (err) {
      console.error(err);
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createTour({
        variables: {
          input: {
            ...form,
            price: parseFloat(form.price),
            images,
            videos,
            servicesIncluded: form.servicesIncluded.split(',').map(s => s.trim()).filter(Boolean),
            servicesExcluded: form.servicesExcluded.split(',').map(s => s.trim()).filter(Boolean)
          }
        }
      });
      alert('Tour created successfully!');
      if (onCreated) onCreated();
      setForm({
        title: '',
        price: '',
        location: '',
        itinerary: '',
        servicesIncluded: '',
        servicesExcluded: '',
        cancelPolicy: '',
        category: '',
        status: 'active'
      });
      setImages([]);
      setVideos([]);
    } catch (err) {
      console.error('Error creating tour:', err);
    }
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const removeVideo = (index) => {
    setVideos(videos.filter((_, i) => i !== index));
  };

  return (
    <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
      <form onSubmit={handleSubmit} className="p-8 space-y-8">
        
        {/* Basic Information Section */}
        <div className="space-y-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900">Basic Information</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            <div className="space-y-3">
              <label className="block text-sm font-bold text-gray-800 uppercase tracking-wide">
                Tour Title
              </label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Enter tour title"
                className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-300 text-gray-900 font-semibold placeholder-gray-400 bg-gray-50 focus:bg-white shadow-sm"
                required
              />
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-bold text-gray-800 uppercase tracking-wide">
                Price ($)
              </label>
              <div className="relative">
                <input
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={handleChange}
                  placeholder="0.00"
                  className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-300 text-gray-900 font-semibold placeholder-gray-400 bg-gray-50 focus:bg-white pr-16 shadow-sm"
                  required
                />
                <div className="absolute right-6 top-1/2 transform -translate-y-1/2 text-gray-500 font-bold text-lg">
                  $
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-bold text-gray-800 uppercase tracking-wide">
                Location
              </label>
              <input
                name="location"
                value={form.location}
                onChange={handleChange}
                placeholder="Enter tour location"
                className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-300 text-gray-900 font-semibold placeholder-gray-400 bg-gray-50 focus:bg-white shadow-sm"
                required
              />
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-bold text-gray-800 uppercase tracking-wide">
                Category
              </label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-300 text-gray-900 font-semibold bg-gray-50 focus:bg-white shadow-sm"
                required
              >
                <option value="">Select Category</option>
                {categories.map(cat => (
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
                value={form.status}
                onChange={handleChange}
                className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-300 text-gray-900 font-semibold bg-gray-50 focus:bg-white shadow-sm"
              >
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-bold text-gray-800 uppercase tracking-wide">
                Cancellation Policy
              </label>
              <input
                name="cancelPolicy"
                value={form.cancelPolicy}
                onChange={handleChange}
                placeholder="Enter cancellation policy"
                className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-300 text-gray-900 font-semibold placeholder-gray-400 bg-gray-50 focus:bg-white shadow-sm"
              />
            </div>
          </div>
        </div>

        {/* Tour Details Section */}
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
                value={form.itinerary}
                onChange={handleChange}
                placeholder="Describe the detailed tour itinerary..."
                rows="6"
                className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-300 text-gray-900 placeholder-gray-400 resize-none bg-gray-50 focus:bg-white shadow-sm"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="block text-sm font-bold text-gray-800 uppercase tracking-wide">
                  Services Included
                </label>
                <textarea
                  name="servicesIncluded"
                  value={form.servicesIncluded}
                  onChange={handleChange}
                  placeholder="Meals, Transport, Guide, Insurance (comma separated)"
                  rows="4"
                  className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-300 text-gray-900 placeholder-gray-400 resize-none bg-gray-50 focus:bg-white shadow-sm"
                />
                <p className="text-xs text-gray-500">Separate multiple services with commas</p>
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-bold text-gray-800 uppercase tracking-wide">
                  Services Excluded
                </label>
                <textarea
                  name="servicesExcluded"
                  value={form.servicesExcluded}
                  onChange={handleChange}
                  placeholder="Personal expenses, Tips, Souvenirs (comma separated)"
                  rows="4"
                  className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-300 text-gray-900 placeholder-gray-400 resize-none bg-gray-50 focus:bg-white shadow-sm"
                />
                <p className="text-xs text-gray-500">Separate multiple services with commas</p>
              </div>
            </div>
          </div>
        </div>

        {/* Media Upload Section */}
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
            {/* Images Upload */}
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="block text-sm font-bold text-gray-800 uppercase tracking-wide">
                  Tour Images
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => {
                      Array.from(e.target.files).forEach(file => uploadFile(file, 'image'));
                    }}
                    className="w-full px-6 py-4 border-2 border-dashed border-gray-300 rounded-2xl focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-300 bg-gray-50 hover:bg-gray-100 text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                    disabled={uploading}
                  />
                  {uploading && (
                    <div className="absolute inset-0 bg-white/80 rounded-2xl flex items-center justify-center">
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                        <span className="text-sm font-medium text-blue-600">Uploading...</span>
                      </div>
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500">Upload multiple images (JPG, PNG, WebP)</p>
              </div>

              {/* Image Preview Grid */}
              {images.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wide">
                    Uploaded Images ({images.length})
                  </h4>
                  <div className="grid grid-cols-3 gap-4">
                    {images.map((url, idx) => (
                      <div key={idx} className="relative group">
                        <img
                          src={url}
                          alt={`Preview ${idx + 1}`}
                          className="w-full h-24 object-cover rounded-xl shadow-sm border border-gray-200 group-hover:shadow-lg transition-shadow duration-200"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs font-bold opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Videos Upload */}
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="block text-sm font-bold text-gray-800 uppercase tracking-wide">
                  Tour Videos
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept="video/*"
                    multiple
                    onChange={(e) => {
                      Array.from(e.target.files).forEach(file => uploadFile(file, 'video'));
                    }}
                    className="w-full px-6 py-4 border-2 border-dashed border-gray-300 rounded-2xl focus:ring-4 focus:ring-purple-500/30 focus:border-purple-500 transition-all duration-300 bg-gray-50 hover:bg-gray-100 text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 cursor-pointer"
                    disabled={uploading}
                  />
                  {uploading && (
                    <div className="absolute inset-0 bg-white/80 rounded-2xl flex items-center justify-center">
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600"></div>
                        <span className="text-sm font-medium text-purple-600">Uploading...</span>
                      </div>
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500">Upload multiple videos (MP4, WebM, MOV)</p>
              </div>

              {/* Video Preview Grid */}
              {videos.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wide">
                    Uploaded Videos ({videos.length})
                  </h4>
                  <div className="space-y-4">
                    {videos.map((url, idx) => (
                      <div key={idx} className="relative group">
                        <video
                          src={url}
                          controls
                          className="w-full h-32 object-cover rounded-xl shadow-sm border border-gray-200 group-hover:shadow-lg transition-shadow duration-200"
                        />
                        <button
                          type="button"
                          onClick={() => removeVideo(idx)}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs font-bold opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div>
                <h4 className="text-lg font-bold text-red-800">Error Creating Tour</h4>
                <p className="text-red-600">{error.message || 'Something went wrong'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="pt-8 border-t border-gray-200">
          <button
            type="submit"
            disabled={loading || uploading}
            className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 disabled:from-gray-400 disabled:via-gray-500 disabled:to-gray-600 text-white px-10 py-5 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 disabled:hover:transform-none transition-all duration-300 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                <span>Creating Tour...</span>
              </div>
            ) : uploading ? (
              <div className="flex items-center justify-center space-x-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                <span>Uploading Files...</span>
              </div>
            ) : (
              'Create Tour'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
