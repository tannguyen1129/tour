'use client';
import { useQuery } from '@apollo/client';
import { GET_LOGS } from '../../../graphql/queries';
import { useAuth } from '../../../context/AuthContext';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '../../../components/AdminLayout';

export default function AdminLogsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { loading, error, data } = useQuery(GET_LOGS);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.push('/login');
    }
  }, [user, router]);

  if (!user || user.role !== 'admin') return <p>Redirecting...</p>;
  if (loading) return <p>Loading logs...</p>;
  if (error) return <p>Error loading logs</p>;

  return (
    <AdminLayout>
      <h1 className="text-xl font-bold mb-4">System Logs</h1>
      <ul>
        {data.logs.map(log => (
          <li key={log.id}>
            {log.actionBy.email} - {log.action} - {new Date(log.actionAt).toLocaleString()}
          </li>
        ))}
      </ul>
    </AdminLayout>
  );
}
