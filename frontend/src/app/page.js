'use client';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { useQuery } from '@apollo/client';
import { GET_TOURS } from '../graphql/queries';

export default function HomePage() {
  const { user } = useAuth();
  const { loading, error, data } = useQuery(GET_TOURS, {
    skip: !user
  });

  // Utility function để build URL ảnh
  const buildUrl = (path) =>
    path?.startsWith('http')
      ? path
      : `${process.env.NEXT_PUBLIC_BACKEND_URL}${path}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-20 right-20 w-60 h-60 bg-indigo-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-purple-400/20 rounded-full blur-2xl animate-pulse delay-2000"></div>
        <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-blue-300/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center max-w-6xl mx-auto mb-20">
          {/* Main Heading */}
          <div className="mb-8">
            <h1 className="text-5xl md:text-7xl font-bold mb-4 leading-tight">
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 bg-clip-text text-transparent">
                Welcome to
              </span>
              <br />
              <span className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-600 bg-clip-text text-transparent">
                Tour Booking
              </span>
            </h1>
            <div className="flex items-center justify-center space-x-2 mb-6">
              <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"></div>
              <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"></div>
              <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"></div>
            </div>
          </div>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-slate-700 mb-12 leading-relaxed max-w-4xl mx-auto font-medium">
            Discover extraordinary destinations and create unforgettable memories with our 
            <span className="text-blue-600 font-semibold"> curated travel experiences</span>
          </p>

          {/* User Greeting */}
          {user && (
            <div className="mb-12 inline-block">
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/50 p-6 shadow-xl">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <p className="text-lg font-semibold text-slate-800">
                      Welcome back, <span className="text-blue-600">{user.name || user.email}</span>!
                    </p>
                    <p className="text-slate-600">Ready for your next adventure?</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
            <Link
              href="/tours"
              className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-lg rounded-2xl shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 min-w-[220px] overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-indigo-700 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span className="relative z-10 flex items-center justify-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Explore Tours</span>
              </span>
            </Link>

            {user?.role === 'customer' && (
              <Link
                href="/bookings"
                className="group px-8 py-4 bg-white/90 backdrop-blur-xl text-blue-600 font-bold text-lg rounded-2xl border-2 border-blue-200 hover:border-blue-400 hover:bg-blue-50 transform hover:-translate-y-2 transition-all duration-300 min-w-[220px] shadow-lg hover:shadow-xl"
              >
                <span className="flex items-center justify-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <span>My Bookings</span>
                </span>
              </Link>
            )}

            {user?.role === 'admin' && (
              <Link
                href="/admin"
                className="group px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-lg rounded-2xl shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 min-w-[240px] overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-700 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="relative z-10 flex items-center justify-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <span>Admin Dashboard</span>
                </span>
              </Link>
            )}
          </div>
        </div>

        {/* Features Grid */}
        <div className="mb-20">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
            Why Choose Us?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: "🏖️",
                title: "Amazing Destinations",
                description: "Explore breathtaking locations around the world with our carefully selected tours",
                gradient: "from-blue-500 to-cyan-500"
              },
              {
                icon: "💰",
                title: "Best Prices",
                description: "Get the most value for your money with our competitive pricing and exclusive deals",
                gradient: "from-emerald-500 to-teal-500"
              },
              {
                icon: "🛡️",
                title: "Secure Booking",
                description: "Book with confidence using our secure payment system and reliable customer support",
                gradient: "from-purple-500 to-pink-500"
              }
            ].map((feature, index) => (
              <div
                key={index}
                className="group bg-white/80 backdrop-blur-xl p-8 rounded-3xl border border-white/50 hover:shadow-2xl transform hover:-translate-y-3 transition-all duration-500 relative overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
                <div className="relative z-10">
                  <div className="text-5xl mb-6 transform group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-4">{feature.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tours Section for logged-in users */}
        {user && (
          <div className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Featured Tours
              </h2>
              <p className="text-slate-600 text-lg">Discover your next adventure</p>
            </div>

            {loading && (
              <div className="text-center py-12">
                <div className="inline-flex items-center space-x-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="text-slate-600 text-lg font-medium">Loading amazing tours...</span>
                </div>
              </div>
            )}

            {error && (
              <div className="text-center py-12">
                <div className="bg-red-50 border border-red-200 rounded-2xl p-6 max-w-md mx-auto">
                  <svg className="w-12 h-12 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <p className="text-red-600 font-medium">Error loading tours: {error.message}</p>
                </div>
              </div>
            )}

            {data?.tours && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {data.tours.slice(0, 6).map((tour, index) => (
                  <div
                    key={tour.id}
                    className="group bg-white/90 backdrop-blur-xl rounded-3xl shadow-lg hover:shadow-2xl transform hover:-translate-y-3 transition-all duration-500 overflow-hidden border border-white/50"
                    style={{
                      animationDelay: `${index * 100}ms`,
                      animation: 'fadeInUp 0.6s ease-out forwards'
                    }}
                  >
                    {/* Tour Image */}
                    <div className="relative h-48 overflow-hidden">
                      {tour.images && tour.images.length > 0 ? (
                        <img
                          src={buildUrl(tour.images[0])}
                          alt={tour.title || 'Tour Image'}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/400x300/3b82f6/ffffff?text=Beautiful+Destination';
                            e.target.alt = 'Tour destination placeholder';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center">
                          <div className="text-center text-white">
                            <svg className="w-16 h-16 mx-auto mb-2 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <p className="text-sm font-medium opacity-90">Beautiful Destination</p>
                          </div>
                        </div>
                      )}
                      
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      
                      {/* Tour Title Overlay */}
                      <div className="absolute bottom-4 left-4 right-4 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                        <h3 className="text-white font-bold text-xl line-clamp-2">{tour.title}</h3>
                      </div>

                      {/* Category Badge */}
                      {tour.category?.name && (
                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-slate-700 px-3 py-1 rounded-full text-xs font-semibold shadow-md border border-white/50">
                          {tour.category.name}
                        </div>
                      )}
                    </div>

                    <div className="p-6">
                      {/* Tour Title (visible when not hovering image) */}
                      <h3 className="text-xl font-bold text-slate-800 mb-4 line-clamp-2 group-hover:opacity-50 transition-opacity duration-300">
                        {tour.title}
                      </h3>

                      <div className="space-y-3 mb-6">
                        <div className="flex items-center text-slate-600">
                          <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span className="truncate">{tour.location}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-slate-600">
                            <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                            </svg>
                            <span className="font-semibold text-lg text-slate-800">${tour.price}</span>
                          </div>
                          {tour.price > 1000 && (
                            <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                              Premium
                            </span>
                          )}
                        </div>
                      </div>

                      <Link
                        href={`/tours/${tour.id}`}
                        className="block w-full text-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
                      >
                        <span className="flex items-center justify-center space-x-2">
                          <span>Explore Tour</span>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </span>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {data?.tours && data.tours.length > 6 && (
              <div className="text-center mt-12">
                <Link
                  href="/tours"
                  className="inline-flex items-center space-x-2 px-8 py-4 bg-white/90 backdrop-blur-xl text-blue-600 font-bold rounded-2xl border-2 border-blue-200 hover:border-blue-400 hover:bg-blue-50 transform hover:-translate-y-1 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  <span>View All Tours</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Call to Action for non-logged users */}
        {!user && (
          <div className="text-center">
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 rounded-3xl p-12 shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="relative z-10">
                <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
                  Ready to Start Your Journey?
                </h2>
                <p className="text-blue-100 mb-8 text-lg max-w-2xl mx-auto leading-relaxed">
                  Join thousands of happy travelers who have discovered their perfect getaway with our amazing tours and experiences
                </p>
                <div className="flex flex-col sm:flex-row gap-6 justify-center">
                  <Link
                    href="/register"
                    className="group px-8 py-4 bg-white text-blue-600 font-bold text-lg rounded-xl hover:bg-gray-100 shadow-xl transform hover:-translate-y-2 transition-all duration-300 min-w-[200px]"
                  >
                    <span className="flex items-center justify-center space-x-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                      </svg>
                      <span>Sign Up Now</span>
                    </span>
                  </Link>
                  <Link
                    href="/login"
                    className="group px-8 py-4 border-2 border-white text-white font-bold text-lg rounded-xl hover:bg-white/10 transform hover:-translate-y-2 transition-all duration-300 min-w-[200px]"
                  >
                    <span className="flex items-center justify-center space-x-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                      </svg>
                      <span>Sign In</span>
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}
