'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAuth from './useAuth';

export default function withAdminGuard(Component) {
  return function GuardedComponent(props) {
    const { user } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!user || user.role !== 'admin') {
        router.push('/login');
      }
    }, [user, router]);

    if (!user || user.role !== 'admin') return <p>Checking permission...</p>;
    return <Component {...props} />;
  };
}
