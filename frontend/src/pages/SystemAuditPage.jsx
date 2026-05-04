import React, { useState, useEffect } from 'react';
import client from '../api/client';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { ShieldCheck, Activity, User, Clock, Terminal, Search, Filter } from 'lucide-react';

const SystemAuditPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchLogs = async () => {
    try {
      // Re-using dashboard data or a specific audit endpoint if implemented
      const response = await client.get('/dashboard'); // Currently returning logs for SysAdmin
      setLogs(response.data?.recentLogs || []);
    } catch (error) {
      console.error('Failed to fetch logs', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 30000); // 30s auto-refresh
    return () => clearInterval(interval);
  }, []);

  const filteredLogs = logs.filter(log => 
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.userId?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.module.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-10 animate-fade-in pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="rose" className="rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest border-none">
              Restricted Access
            </Badge>
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">System Audit logs</h1>
          <p className="text-lg text-slate-500 font-medium tracking-tight">Monitor real-time system activity and security events.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Stats Column */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="!rounded-[28px] border-none shadow-xl shadow-slate-200/40 bg-slate-900 text-white p-6">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mb-6">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">Security Status</p>
            <h3 className="text-3xl font-black mb-6">Operational</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b border-white/5">
                <span className="text-sm font-bold opacity-60">Total Logs</span>
                <span className="font-black text-primary-foreground">{logs.length} tracked</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm font-bold opacity-60">System Health</span>
                <span className="font-black text-emerald-400">99.9%</span>
              </div>
            </div>
          </Card>

          <Card className="!p-6 !rounded-[28px] border-none shadow-xl shadow-slate-200/40">
             <div className="flex items-center gap-2 mb-6 text-slate-900">
               <Filter className="w-4 h-4" />
               <span className="text-sm font-black uppercase tracking-wider">Search Archive</span>
             </div>
             <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Filter by action..."
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
             </div>
          </Card>
        </div>

        {/* Logs Feed */}
        <div className="lg:col-span-3">
          <Card className="!p-0 !rounded-[32px] border-none shadow-xl shadow-slate-200/50 overflow-hidden">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <Activity className="w-4 h-4" />
                </div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Real-time Activity Stream</h3>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                Live Update
              </div>
            </div>

            <div className="divide-y divide-slate-50 max-h-[600px] overflow-y-auto custom-scrollbar">
              {loading ? (
                [1,2,3,4,5].map(i => (
                  <div key={i} className="p-8 animate-pulse flex items-center gap-6">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-1/4 bg-slate-100 rounded"></div>
                      <div className="h-3 w-1/2 bg-slate-50 rounded"></div>
                    </div>
                  </div>
                ))
              ) : filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <div key={log._id} className="p-8 hover:bg-slate-50/50 transition-colors flex items-center gap-6 group">
                     <div className={`w-14 h-14 rounded-[20px] flex items-center justify-center shrink-0 shadow-sm transition-all group-hover:scale-110 group-hover:-rotate-3 ${
                        log.action.includes('LOGIN') ? 'bg-indigo-50 text-indigo-600' :
                        log.action.includes('CREATE') ? 'bg-emerald-50 text-emerald-600' :
                        log.action.includes('REGISTER') ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-600'
                     }`}>
                        <Terminal className="w-6 h-6" />
                     </div>
                     <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1.5">
                           <h4 className="text-lg font-black text-slate-900 tracking-tight">{log.action}</h4>
                           <div className="flex items-center gap-2 text-slate-400">
                             <Clock className="w-3.5 h-3.5" />
                             <span className="text-[11px] font-bold uppercase tracking-wider">{new Date(log.createdAt).toLocaleString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                           </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm font-medium text-slate-500">
                           <div className="flex items-center gap-1.5">
                              <User className="w-3.5 h-3.5" />
                              <span className="font-black text-slate-700">{log.userId?.fullName || 'System Event'}</span>
                           </div>
                           <div className="w-1 h-1 rounded-full bg-slate-200"></div>
                           <Badge variant="primary" className="rounded-lg text-[9px] h-5 opacity-60">{log.module}</Badge>
                        </div>
                     </div>
                  </div>
                ))
              ) : (
                <div className="py-24 text-center">
                   <Terminal className="w-16 h-16 text-slate-100 mx-auto mb-4" />
                   <p className="text-slate-400 font-bold">No audit logs found for the current filter.</p>
                </div>
              )}
            </div>
            
            <div className="p-6 bg-slate-50/50 border-t border-slate-50 text-center">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">End of Archive</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SystemAuditPage;
