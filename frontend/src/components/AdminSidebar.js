'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminSidebar() {
  const pathname = usePathname();

  const menuItems = [
    {
      href: '/admin',
      label: 'Dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      description: 'Overview & Analytics'
    },
    {
      href: '/admin/tours',
      label: 'Tours',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      description: 'Manage Tours'
    },
    {
      href: '/admin/bookings',
      label: 'Bookings',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      description: 'Manage Bookings'
    },
    {
      href: '/admin/users',
      label: 'Users',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      ),
      description: 'Manage Users'
    },
    {
      href: '/admin/vouchers',
      label: 'Vouchers',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
      ),
      description: 'Manage Vouchers'
    },
    {
      href: '/admin/reviews',
      label: 'Reviews',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      ),
      description: 'Manage Reviews'
    },
    {
      href: '/admin/categories',
      label: 'Categories',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      description: 'Manage Categories'
    },
    {
      href: '/admin/logs',
      label: 'System Logs',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      description: 'View System Logs'
    }
  ];

  const isActive = (href) => {
    if (href === '/admin') {
      return pathname === '/admin';
    }
    return pathname.startsWith(href);
  };

  return (
    <nav className="space-y-2">
      {/* Navigation Header */}
      <div className="mb-6">
        <h3 className="text-xs font-semibold text-blue-200/80 uppercase tracking-wider px-3">
          Navigation
        </h3>
      </div>

      {/* Menu Items */}
      {menuItems.map((item, index) => {
        const active = isActive(item.href);
        
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`
              group relative flex items-center px-3 py-3 rounded-2xl transition-all duration-300 transform hover:scale-[1.02]
              ${active 
                ? 'bg-white/20 text-white shadow-lg backdrop-blur-sm border border-white/30' 
                : 'text-blue-100/90 hover:bg-white/10 hover:text-white'
              }
            `}
            style={{
              animationDelay: `${index * 50}ms`,
              animation: 'slideInLeft 0.5s ease-out forwards'
            }}
          >
            {/* Active Indicator */}
            {active && (
              <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-blue-400 to-indigo-500 rounded-r-full"></div>
            )}

            {/* Icon Container */}
            <div className={`
              flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300
              ${active 
                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg' 
                : 'bg-white/10 text-blue-200 group-hover:bg-white/20 group-hover:text-white'
              }
            `}>
              {item.icon}
            </div>

            {/* Content */}
            <div className="ml-4 flex-1">
              <div className={`
                font-semibold transition-colors duration-300
                ${active ? 'text-white' : 'text-blue-100 group-hover:text-white'}
              `}>
                {item.label}
              </div>
              <div className={`
                text-xs transition-colors duration-300
                ${active ? 'text-blue-200' : 'text-blue-200/60 group-hover:text-blue-200'}
              `}>
                {item.description}
              </div>
            </div>

            {/* Arrow Indicator */}
            <div className={`
              transform transition-all duration-300
              ${active ? 'translate-x-0 opacity-100' : 'translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100'}
            `}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>

            {/* Hover Glow Effect */}
            <div className={`
              absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300
              bg-gradient-to-r from-blue-500/20 to-indigo-500/20 blur-xl
            `}></div>
          </Link>
        );
      })}

      {/* Quick Actions Section */}
      <div className="mt-8 pt-6 border-t border-white/10">
        <h3 className="text-xs font-semibold text-blue-200/80 uppercase tracking-wider px-3 mb-4">
          Quick Actions
        </h3>
        
        <div className="space-y-2">
          <button className="w-full flex items-center px-3 py-2 text-blue-100/90 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-300 group">
            <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center mr-3 group-hover:bg-green-500/30 transition-colors">
              <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <span className="text-sm font-medium">Add New Tour</span>
          </button>
          
          <button className="w-full flex items-center px-3 py-2 text-blue-100/90 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-300 group">
            <div className="w-8 h-8 bg-yellow-500/20 rounded-lg flex items-center justify-center mr-3 group-hover:bg-yellow-500/30 transition-colors">
              <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <span className="text-sm font-medium">View Reports</span>
          </button>
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </nav>
  );
}
