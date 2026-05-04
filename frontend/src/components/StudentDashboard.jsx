import React from 'react';
import StatCard from '../components/StatCard';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { BookOpen, Calendar, Bell, ShoppingBag, Clock, MapPin, ChevronRight, Users } from 'lucide-react';

const StudentDashboard = ({ data }) => {
  const { stats, upcomingAssignments, upcomingEvents, discoverableMarketplace, discoverableGroups } = data;

  return (
    <div className="space-y-10 animate-fade-in pb-12">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
          Welcome back, <span className="gradient-text">Student!</span>
        </h1>
        <p className="text-lg text-slate-500 font-medium tracking-tight">Here's your academic briefing for today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard title="Study Groups" value={stats.myGroups || 0} icon={Users} color="primary" />
        <StatCard title="Assignments" value={stats.pendingAssignments || 0} icon={BookOpen} color="indigo" />
        <StatCard title="Campus Events" value={stats.upcomingEventsCount || 0} icon={Bell} color="emerald" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Assignments Section */}
        <Card className="!rounded-[32px] border-none shadow-xl shadow-slate-200/50">
          <Card.Header 
            title="Deadlines" 
            subtitle="Upcoming assignment submissions" 
          />
          <Card.Content className="space-y-3 pt-4">
            {upcomingAssignments && upcomingAssignments.length > 0 ? upcomingAssignments.map((assignment) => (
              <div key={assignment._id} className="flex items-center justify-between p-5 bg-slate-50/50 hover:bg-slate-50 rounded-2xl transition-all border border-transparent hover:border-slate-100 group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm text-primary group-hover:bg-primary group-hover:text-white transition-all">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-black text-slate-900 leading-tight">{assignment.title}</p>
                    <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">{assignment.module || 'General'}</p>
                  </div>
                </div>
                <div className="text-right flex flex-col items-end gap-2">
                  <p className="text-sm font-black text-slate-900 bg-white px-3 py-1 rounded-full border border-slate-100 shadow-sm">
                    {new Date(assignment.dueDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                  </p>
                  <Badge variant={assignment.priority === 'High' ? 'danger' : 'warning'} className="rounded-lg text-[10px] uppercase">
                    {assignment.priority || 'Pending'}
                  </Badge>
                </div>
              </div>
            )) : (
              <div className="py-16 text-center text-slate-400 font-bold bg-slate-50/30 rounded-3xl mx-2 border-2 border-dashed border-slate-100">
                All assignments caught up!
              </div>
            )}
            <button className="w-full py-4 text-sm font-black text-primary hover:bg-primary/5 rounded-2xl transition-all border border-transparent hover:border-primary/10 mt-2">
              View All Assignments
            </button>
          </Card.Content>
        </Card>

        {/* Events Section */}
        <Card className="!rounded-[32px] border-none shadow-xl shadow-slate-200/50">
          <Card.Header 
            title="Campus Events" 
            subtitle="Don't miss out on campus life" 
          />
          <Card.Content className="space-y-4 pt-4">
            {upcomingEvents && upcomingEvents.length > 0 ? upcomingEvents.map((event) => (
              <div key={event._id} className="flex items-center gap-5 p-5 bg-white border border-slate-100 rounded-2xl hover:shadow-lg hover:shadow-slate-200 transition-all cursor-pointer group">
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex flex-col items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                  <p className="text-[10px] font-black leading-none mb-1">{new Date(event.date).toLocaleString('default', { month: 'short' }).toUpperCase()}</p>
                  <p className="text-xl font-black leading-none">{new Date(event.date).getDate()}</p>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-slate-900 text-lg leading-snug truncate">{event.title}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-1 text-xs font-bold text-slate-400">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs font-bold text-slate-400">
                      <MapPin className="w-3.5 h-3.5" />
                      <span className="truncate">{event.venue}</span>
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-primary transition-colors" />
              </div>
            )) : (
              <div className="py-16 text-center text-slate-400 font-bold bg-slate-50/30 rounded-3xl mx-2 border-2 border-dashed border-slate-100">
                No events today.
              </div>
            )}
             <button className="w-full py-4 text-sm font-black text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all border border-transparent hover:border-indigo-100 mt-2">
              Browse Events
            </button>
          </Card.Content>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Marketplace Discovery */}
        <Card className="!rounded-[32px] border-none shadow-xl shadow-slate-200/50">
          <Card.Header 
            title="Marketplace" 
            subtitle="Recent items for sale from students" 
          />
          <Card.Content className="pt-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {discoverableMarketplace && discoverableMarketplace.length > 0 ? discoverableMarketplace.map((item) => (
                <div key={item._id} className="group cursor-pointer">
                  <div className="aspect-square rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 relative mb-2">
                    {item.images?.[0] ? (
                      <img 
                        src={`http://localhost:5000/${item.images[0].replace('\\', '/')}`} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        alt={item.title}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-200">
                        <ShoppingBag className="w-8 h-8" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-white/90 backdrop-blur font-black text-slate-900 border-none shadow-sm text-[10px] px-2">${item.price}</Badge>
                    </div>
                  </div>
                  <p className="text-xs font-black text-slate-900 truncate leading-tight">{item.title}</p>
                </div>
              )) : (
                <div className="col-span-full py-12 text-center text-slate-400 font-bold border-2 border-dashed border-slate-100 rounded-3xl">
                  Nothing for sale yet.
                </div>
              )}
            </div>
            <button className="w-full py-4 text-sm font-black text-primary hover:bg-primary/5 rounded-2xl transition-all border border-transparent hover:border-primary/10 mt-6">
              Shop Marketplace
            </button>
          </Card.Content>
        </Card>

        {/* Study Groups Discovery */}
        <Card className="!rounded-[32px] border-none shadow-xl shadow-slate-200/50">
          <Card.Header 
            title="Study Groups" 
            subtitle="Find study partners for your courses" 
          />
          <Card.Content className="space-y-3 pt-4">
            {discoverableGroups && discoverableGroups.length > 0 ? discoverableGroups.map((group) => (
              <div key={group._id} className="flex items-center justify-between p-4 bg-slate-50/50 hover:bg-slate-50 rounded-2xl border border-transparent hover:border-slate-100 transition-all group">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all shrink-0">
                    <Users className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-black text-slate-900 leading-tight truncate">{group.name}</p>
                    <p className="text-[10px] font-bold text-slate-400 mt-0.5 uppercase tracking-wider">{group.course}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-1 bg-white rounded-lg border border-slate-100 shadow-sm shrink-0 ml-4">
                  <Users className="w-3 h-3 text-slate-400" />
                  <span className="text-[10px] font-black text-slate-600">{group.members?.length || 0}</span>
                </div>
              </div>
            )) : (
              <div className="py-12 text-center text-slate-400 font-bold border-2 border-dashed border-slate-100 rounded-3xl">
                No active groups found.
              </div>
            )}
            <button className="w-full py-4 text-sm font-black text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all border border-transparent hover:border-indigo-100 mt-3">
              Explore All Groups
            </button>
          </Card.Content>
        </Card>
      </div>
    </div>
  );
};

export default StudentDashboard;
