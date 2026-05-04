import React from 'react';
import StatCard from '../components/StatCard';
import Card from '../components/ui/Card';
import { Calendar, BookOpen, Bell, ShieldCheck, TrendingUp, AlertCircle, PlusCircle, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from './ui/Button';

const AdminDashboard = ({ data }) => {
  const { stats, recentActivity } = data;

  return (
    <div className="space-y-10 animate-fade-in pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
        <div className="flex flex-col gap-1">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">Admin Overview</h1>
          <p className="text-lg text-slate-500 font-medium tracking-tight">Manage campus resources and educator schedules.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="bg-white rounded-2xl border-slate-200 font-black px-6 shadow-sm">
            <ExternalLink className="w-4 h-4 mr-2" />
            Export Audit
          </Button>
          <Button className="rounded-2xl shadow-lg shadow-primary/20 font-black px-6">
            <PlusCircle className="w-4 h-4 mr-2" />
            Post Update
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Timetables" value={stats.myEvents || 0} icon={Calendar} trend={+5} color="primary" />
        <StatCard title="Assignments" value={stats.myAssignments || 0} icon={BookOpen} trend={+14} color="indigo" />
        <StatCard title="Total Students" value={stats.totalStudents || 0} icon={UsersIcon} trend={+8} color="emerald" />
        <StatCard title="System Health" value="99.9%" icon={ShieldCheck} color="violet" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 !rounded-[32px] border-none shadow-xl shadow-slate-200/50">
          <Card.Header title="Moderation Activity" subtitle="Recent changes managed by your account" />
          <Card.Content className="pt-4">
             {recentActivity && recentActivity.length > 0 ? (
                <div className="space-y-4">
                   {recentActivity.map((log, i) => (
                      <div key={i} className="flex items-center justify-between p-5 bg-slate-50/50 rounded-2xl border border-transparent hover:border-slate-100 transition-all">
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-primary shadow-sm">
                              <Activity className="w-5 h-5" />
                           </div>
                           <div>
                              <p className="font-bold text-slate-900">{log.action}</p>
                              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-0.5">{new Date(log.createdAt).toLocaleDateString()}</p>
                           </div>
                        </div>
                        <Badge variant="primary" className="rounded-lg">Success</Badge>
                      </div>
                   ))}
                </div>
             ) : (
                <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-3xl bg-slate-50/50">
                  <TrendingUp className="w-12 h-12 text-slate-200 mb-4" />
                  <p className="text-slate-400 font-bold">Activity visualization coming soon</p>
                </div>
             )}
          </Card.Content>
        </Card>

        <Card className="!rounded-[32px] border-none shadow-xl shadow-slate-200/50">
          <Card.Header title="Quick Management" subtitle="Frequently used tasks" />
          <Card.Content className="space-y-3 pt-4">
            {[
              { name: 'Update Timetable', path: '/timetable', icon: Calendar, color: 'bg-primary/10 text-primary' },
              { name: 'Post Assignment', path: '/assignments', icon: BookOpen, color: 'bg-indigo-50 text-indigo-600' },
              { name: 'Broadcast Event', path: '/events', icon: Bell, color: 'bg-emerald-50 text-emerald-600' },
            ].map((action) => (
              <Link 
                key={action.name} 
                to={action.path}
                className="flex items-center justify-between p-5 bg-white border border-slate-100 rounded-2xl hover:border-primary/50 hover:shadow-lg hover:shadow-slate-100 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center transition-all group-hover:scale-110", action.color)}>
                    <action.icon className="w-6 h-6" />
                  </div>
                  <span className="font-black text-slate-900 leading-tight">{action.name}</span>
                </div>
                <PlusCircle className="w-5 h-5 text-slate-300 group-hover:text-primary transition-colors" />
              </Link>
            ))}
            
            <div className="mt-8 p-6 bg-amber-50 rounded-[28px] border border-amber-100/50 flex gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-600 flex items-center justify-center shrink-0 shadow-lg shadow-amber-200">
                <AlertCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-black text-amber-900 leading-tight">System Notice</p>
                <p className="text-xs text-amber-700 font-medium mt-1 leading-relaxed">There are 3 events pending content moderation and review.</p>
              </div>
            </div>
          </Card.Content>
        </Card>
      </div>
    </div>
  );
};

// Mock UserIcon since it might not be imported or exist in same scope
const UsersIcon = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const Activity = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
);

const cn = (...classes) => classes.filter(Boolean).join(' ');

export default AdminDashboard;
