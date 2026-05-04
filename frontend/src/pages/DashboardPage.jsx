import { useEffect, useState } from 'react';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import StudentDashboard from '../components/StudentDashboard';
import AdminDashboard from '../components/AdminDashboard';
import SystemAdminDashboard from '../components/SystemAdminDashboard';

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user, isSystemAdmin, isAdmin } = useAuth();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await client.get('/dashboard');
        setData(response.data);
      } catch (error) {
        console.error('Failed to fetch dashboard data', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse p-4">
        <div className="flex items-center justify-between mb-8">
          <div className="h-10 w-64 bg-slate-200 rounded-2xl"></div>
          <div className="h-10 w-32 bg-slate-200 rounded-2xl"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-slate-100 rounded-3xl border border-slate-50"></div>)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="h-[400px] bg-slate-50 rounded-3xl border border-slate-100"></div>
          <div className="h-[400px] bg-slate-50 rounded-3xl border border-slate-100"></div>
        </div>
      </div>
    );
  }

  if (!data) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8 bg-slate-50 rounded-3xl">
      <h2 className="text-xl font-bold text-slate-900">Unable to load dashboard</h2>
      <p className="text-slate-500 mt-2">There was an error connecting to the system. Please try again later.</p>
    </div>
  );

  if (isSystemAdmin) {
    return <SystemAdminDashboard data={data} />;
  }

  if (isAdmin) {
    return <AdminDashboard data={data} />;
  }

  return <StudentDashboard data={data} />;
}
