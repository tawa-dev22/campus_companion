import React from 'react';
import { Users, ShieldAlert, Activity, Database, Key, Server, Hash, FileText } from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement } from 'chart.js';
import { Pie, Line } from 'react-chartjs-2';
import StatCard from '../components/StatCard';
import Card from '../components/ui/Card';
import Button from './ui/Button';
import Badge from './ui/Badge';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement);

const SystemAdminDashboard = ({ data }) => {
  const { stats, recentLogs } = data;

  const roleChartData = {
    labels: Object.keys(stats.roleStats || {}),
    datasets: [{
      data: Object.values(stats.roleStats || {}),
      backgroundColor: ['#4f46e5', '#10b981', '#f59e0b', '#ef4444'],
      borderWidth: 0,
      hoverOffset: 4
    }]
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">System Control Center</h1>
          <p className="text-slate-500 font-medium mt-1">Infrastructure Health & Identity Management</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="bg-white rounded-2xl border-slate-200">
            <Server className="w-4 h-4 mr-2" />
            System Status
          </Button>
          <Button variant="danger" className="rounded-2xl shadow-lg shadow-rose-200">
            <ShieldAlert className="w-4 h-4 mr-2" />
            Security Audit
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Users" value={stats.totalUsers} icon={Users} trend={+2} />
        <StatCard title="Active Assignments" value={stats.totalAssignments} icon={FileText} color="indigo" />
        <StatCard title="Global Events" value={stats.totalEvents} icon={Activity} color="emerald" />
        <StatCard title="Market Listings" value={stats.totalMarketplace} icon={Database} color="violet" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Role Distribution Chart */}
        <Card className="lg:col-span-1 !rounded-[32px] border-none shadow-xl shadow-slate-200/50">
          <Card.Header title="User Distribution" subtitle="Account allocation by role" />
          <Card.Content className="flex flex-col items-center justify-center pt-4">
            <div className="w-full max-w-[240px] mb-8">
              <Pie data={roleChartData} options={{ plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, padding: 20 } } } }} />
            </div>
          </Card.Content>
        </Card>

        {/* Audit Logs */}
        <Card className="lg:col-span-2 !rounded-[32px] border-none shadow-xl shadow-slate-200/50">
          <Card.Header title="Recent Audit Logs" subtitle="Critical system actions (System Admin Only)" />
          <Card.Content>
            <div className="space-y-1">
              {recentLogs && recentLogs.length > 0 ? (
                recentLogs.map((log, i) => (
                  <div key={i} className="flex items-start gap-4 p-4 hover:bg-slate-50 rounded-2xl transition-all group border-b border-slate-50 last:border-0">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                      log.action.includes('LOGIN') ? 'bg-emerald-50 text-emerald-600' : 
                      log.action.includes('REGISTER') ? 'bg-blue-50 text-blue-600' :
                      log.action.includes('DELETE') ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-600'
                    )}>
                      <Key className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-black text-slate-900">{log.action}</p>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">{new Date(log.createdAt).toLocaleTimeString()}</span>
                      </div>
                      <p className="text-sm text-slate-500 truncate">User: <span className="font-bold text-slate-700">{log.userId?.fullName || 'System'}</span> • Module: {log.module}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-slate-400">No recent audit logs found.</div>
              )}
            </div>
            <Button variant="outline" className="w-full mt-6 rounded-2xl border-slate-100 bg-slate-50/50 hover:bg-slate-50">View Full Audit Trail</Button>
          </Card.Content>
        </Card>
      </div>
    </div>
  );
};

export default SystemAdminDashboard;
